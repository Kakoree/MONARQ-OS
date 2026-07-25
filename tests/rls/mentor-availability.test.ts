import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FIXTURES, signInAs } from "../setup/clients";
import { clearNotificationsFor } from "../setup/admin";
import type { Database } from "../../lib/supabase/types";

let memberA: SupabaseClient<Database>;
let memberB: SupabaseClient<Database>;
let mentor: SupabaseClient<Database>;
let admin: SupabaseClient<Database>;

let mentorRowId: string;
const createdSlotIds: string[] = [];
const createdRequestIds: string[] = [];

function futureIso(hoursAhead: number): string {
  return new Date(Date.now() + hoursAhead * 3600_000).toISOString();
}

async function publishSlot(startsAt: string): Promise<string> {
  const { data, error } = await mentor
    .from("mentor_availability_slots")
    .insert({ mentor_id: mentorRowId, starts_at: startsAt, duration_minutes: 30 })
    .select("id")
    .single();
  if (error) throw new Error(`slot fixture setup failed: ${error.message}`);
  createdSlotIds.push(data.id);
  return data.id;
}

async function slotStartsAt(slotId: string): Promise<string> {
  const { data } = await admin
    .from("mentor_availability_slots")
    .select("starts_at")
    .eq("id", slotId)
    .single();
  return data!.starts_at;
}

beforeAll(async () => {
  memberA = await signInAs(FIXTURES.memberA.email, FIXTURES.memberA.password);
  memberB = await signInAs(FIXTURES.memberB.email, FIXTURES.memberB.password);
  mentor = await signInAs(FIXTURES.mentorA.email, FIXTURES.mentorA.password);
  admin = await signInAs(FIXTURES.adminA.email, FIXTURES.adminA.password);

  const { data, error } = await memberA
    .from("mentors")
    .select("id")
    .eq("user_id", FIXTURES.mentorA.id)
    .single();
  if (error || !data) throw new Error("test-mentor fixture row not found — check provisioning");
  mentorRowId = data.id;
});

afterAll(async () => {
  // Slots reference requests, so clear the link before deleting either.
  for (const id of createdSlotIds) {
    await admin.from("mentor_availability_slots").delete().eq("id", id);
  }
  for (const id of createdRequestIds) {
    await admin.from("mentorship_requests").delete().eq("id", id);
  }

  // book_mentorship_slot and cancel_mentorship_request both notify.
  await clearNotificationsFor([
    FIXTURES.memberA.id,
    FIXTURES.memberB.id,
    FIXTURES.mentorA.id,
    FIXTURES.adminA.id,
  ]);
});

describe("mentor_availability_slots write policies", () => {
  it("lets the owning mentor publish a slot", async () => {
    const id = await publishSlot(futureIso(48));
    expect(id).toBeTruthy();
  });

  it("refuses to let a member publish a slot on a mentor's behalf", async () => {
    const { error } = await memberA
      .from("mentor_availability_slots")
      .insert({ mentor_id: mentorRowId, starts_at: futureIso(72), duration_minutes: 30 });
    expect(error).toBeTruthy();
  });

  it("refuses to let a member withdraw a mentor's slot", async () => {
    const slotId = createdSlotIds[0];
    await memberA.from("mentor_availability_slots").delete().eq("id", slotId);

    // Delete is a silent no-op under RLS, so assert the row survived.
    const { data } = await admin
      .from("mentor_availability_slots")
      .select("id")
      .eq("id", slotId);
    expect(data).toHaveLength(1);
  });
});

describe("mentor_availability_slots SELECT policy", () => {
  it("lets any active member see an approved mentor's slots", async () => {
    const { data, error } = await memberB
      .from("mentor_availability_slots")
      .select("id")
      .eq("id", createdSlotIds[0]);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });
});

describe("book_mentorship_slot", () => {
  it("rejects the mentor booking their own slot", async () => {
    const { error } = await mentor.rpc("book_mentorship_slot", {
      p_slot_id: createdSlotIds[0],
      p_message: "self-booking attempt",
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/cannot book your own slot/i);
  });

  it("books an open slot and confirms it at the slot's own time", async () => {
    const slotId = await publishSlot(futureIso(96));

    const { data, error } = await memberA.rpc("book_mentorship_slot", {
      p_slot_id: slotId,
      p_message: "booked in tests",
    });
    expect(error).toBeNull();
    createdRequestIds.push(data as string);

    const { data: request } = await memberA
      .from("mentorship_requests")
      .select("status, scheduled_at")
      .eq("id", data as string)
      .single();

    // Publishing the slot was the mentor committing to the time, so the
    // booking lands already confirmed rather than pending.
    expect(request?.status).toBe("confirmed");

    const { data: slot } = await admin
      .from("mentor_availability_slots")
      .select("starts_at, booked_request_id")
      .eq("id", slotId)
      .single();
    expect(slot?.booked_request_id).toBe(data);
    expect(new Date(request!.scheduled_at!).toISOString()).toBe(
      new Date(slot!.starts_at).toISOString()
    );
  });

  it("refuses a second booking of the same slot", async () => {
    const slotId = createdSlotIds[createdSlotIds.length - 1];
    const { error } = await memberB.rpc("book_mentorship_slot", {
      p_slot_id: slotId,
      p_message: "double-booking attempt",
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/already booked/i);
  });

  it("refuses to let the mentor withdraw a slot someone has booked", async () => {
    const slotId = createdSlotIds[createdSlotIds.length - 1];
    await mentor.from("mentor_availability_slots").delete().eq("id", slotId);

    const { data } = await admin
      .from("mentor_availability_slots")
      .select("id")
      .eq("id", slotId);
    expect(data).toHaveLength(1);
  });

  it("reopens the slot once the booking is cancelled", async () => {
    const slotId = createdSlotIds[createdSlotIds.length - 1];
    const requestId = createdRequestIds[createdRequestIds.length - 1];

    const { error: cancelError } = await memberA.rpc("cancel_mentorship_request", {
      p_request_id: requestId,
    });
    expect(cancelError).toBeNull();

    // booked_request_id still points at the cancelled request — openness is
    // derived from its status, which is what lets 0039's lifecycle
    // functions stay untouched.
    const { data: rebooked, error } = await memberB.rpc("book_mentorship_slot", {
      p_slot_id: slotId,
      p_message: "rebooked after cancellation",
    });
    expect(error).toBeNull();
    createdRequestIds.push(rebooked as string);
  });

  // The sequential case above only proves the state check. This is the
  // actual claim the `for update` lock in 0043 makes: two members hitting
  // the same open slot at the same instant must not both get a session.
  it("survives two members booking the same slot concurrently", async () => {
    const slotId = await publishSlot(futureIso(120));

    const [first, second] = await Promise.all([
      memberA.rpc("book_mentorship_slot", { p_slot_id: slotId, p_message: "race A" }),
      memberB.rpc("book_mentorship_slot", { p_slot_id: slotId, p_message: "race B" }),
    ]);

    const succeeded = [first, second].filter((r) => !r.error);
    const failed = [first, second].filter((r) => r.error);

    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(1);
    expect(failed[0].error!.message).toMatch(/already booked/i);

    createdRequestIds.push(succeeded[0].data as string);

    // And exactly one request exists against that slot, not two.
    const { data: requests } = await admin
      .from("mentorship_requests")
      .select("id")
      .eq("mentor_id", mentorRowId)
      .eq("scheduled_at", (await slotStartsAt(slotId)) as string);
    expect(requests).toHaveLength(1);
  });

  it("rejects booking a slot in the past", async () => {
    const { data: pastSlot, error: setupError } = await admin
      .from("mentor_availability_slots")
      .insert({
        mentor_id: mentorRowId,
        starts_at: new Date(Date.now() - 3600_000).toISOString(),
        duration_minutes: 30,
      })
      .select("id")
      .single();
    expect(setupError).toBeNull();
    createdSlotIds.push(pastSlot!.id);

    const { error } = await memberA.rpc("book_mentorship_slot", {
      p_slot_id: pastSlot!.id,
      p_message: "past booking attempt",
    });
    expect(error).toBeTruthy();
    expect(error!.message).toMatch(/in the past/i);
  });
});
