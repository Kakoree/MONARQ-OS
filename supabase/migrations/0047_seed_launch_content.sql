-- MONARQ OS — V4 Phase 1: launch content
-- Run after 0001–0046.
--
-- Until now the app has been structurally complete and completely empty:
-- zero teachings, challenges, seasons and tiers, which meant the library,
-- the leaderboard, the tier badges, the Home season module and drop
-- tier-gating all rendered blank or degraded. This is the content those
-- surfaces were built for.
--
-- Voice and substance derive from the project's own material —
-- docs/obsidian/MONARQ OS ROADMAP NOTES (Core promise, Brand doctrine,
-- Lifestyle archetypes). Tracks map onto the archetypes; tiers use the
-- monarch ladder the brand name already implies.
--
-- Deliberately NOT seeded: events and drops. Both represent real-world
-- commitments — a call that actually happens, a product that actually
-- exists. Inventing them would breach the brand doctrine's explicit
-- "no fake flex, no manufactured" rule. Those stay for a human to create.

-- Season ---------------------------------------------------------------

insert into public.seasons (name, starts_at, ends_at, is_active)
values (
  'Season I — Foundation',
  date_trunc('day', now()),
  date_trunc('day', now()) + interval '90 days',
  true
);

-- Tiers ----------------------------------------------------------------
-- Thresholds are deliberately reachable: a member checking in daily earns
-- roughly 10 XP/day, so Initiate → Disciplined is about three weeks of
-- real consistency rather than a number that looks impressive and never
-- moves.

insert into public.tiers (name, min_points, sort_order) values
  ('Initiate',    0,    1),
  ('Disciplined', 200,  2),
  ('Forged',      600,  3),
  ('Sovereign',   1400, 4),
  ('Monarch',     3000, 5);

-- Teaching tracks and teachings ----------------------------------------

with tracks as (
  insert into public.teaching_categories (name, sort_order) values
    ('Foundations',           1),
    ('The Body',              2),
    ('The Build',             3),
    ('The Quiet Work',        4),
    ('Standards and Circle',  5)
  returning id, name
),
inserted as (
  insert into public.teachings
    (category_id, title, summary, required_role, sort_order, is_published)
  select
    tracks.id, v.title, v.summary, v.required_role::public.member_role,
    v.sort_order, true
  from (values
    ('Foundations', 'What MONARQ Actually Is',
     'The promise, stated plainly — and the things this is deliberately not.',
     1, 'member'),
    ('Foundations', 'Discipline Is Not Motivation',
     'Why waiting to feel ready is the most common way people stall for years.',
     2, 'member'),
    ('Foundations', 'The Standard You Keep Alone',
     'What you do when nobody is watching is the only honest measure of where you are.',
     3, 'member'),

    ('The Body', 'Train for the Decade',
     'Most training plans are written for twelve weeks. Yours should survive ten years.',
     1, 'member'),
    ('The Body', 'Recovery Is Part of the Work',
     'Rest is not the reward for training. It is where the training becomes real.',
     2, 'member'),

    ('The Build', 'Build Something That Outlasts the Moment',
     'The difference between output and an asset, and why only one compounds.',
     1, 'member'),
    ('The Build', 'Leverage Over Hours',
     'You cannot out-work a bad structure. Fix the structure first.',
     2, 'member'),

    ('The Quiet Work', 'Consistency Nobody Sees',
     'The unglamorous middle, and why almost everyone quits inside it.',
     1, 'member'),
    ('The Quiet Work', 'Sit With It',
     'Stillness as a trainable skill rather than a personality trait.',
     2, 'member'),

    ('Standards and Circle', 'Standards Are a Form of Respect',
     'How you dress, speak and show up is information you are giving people.',
     1, 'member'),
    ('Standards and Circle', 'The Circle Sets the Ceiling',
     'You do not rise past the standard of the people you spend your weeks with.',
     2, 'member')
  ) as v(track, title, summary, sort_order, required_role)
  join tracks on tracks.name = v.track
  returning id, title
)
insert into public.teaching_content (teaching_id, body)
select inserted.id, b.body
from (values

('What MONARQ Actually Is', $body$MONARQ is where disciplined, ambitious people turn self-development into a lifestyle.

That sentence is doing more work than it looks like. Read it again, slowly.

**Lifestyle**, not project. A project ends. You finish it, you post about it, you drift. A lifestyle is the thing you return to on the days it is inconvenient — which is most days.

**Disciplined and ambitious**, both. Ambition without discipline is a mood board. Discipline without ambition is just endurance for its own sake. The people who get somewhere hold both at once.

Here is what this is not.

It is not instant success. Nothing here will make the next six months faster than six months.

It is not fake luxury. You will not find borrowed watches or rented cars. The brand doctrine rules that out explicitly, and so does the app — every number you see about yourself is computed from something you actually did.

It is not hype. Nobody here is going to tell you that you are crushing it when you are not. Your streak is your streak. Your check-ins are your check-ins.

What it is: exclusive access, real discipline, elevated identity, and a strong circle. Four things, and they reinforce each other. The access is what keeps the circle strong. The circle is what makes the discipline survivable. The discipline is what earns the identity.

You are here because someone gave you a code. That is the access. The rest is on you.$body$),

('Discipline Is Not Motivation', $body$Motivation is a feeling. Discipline is a structure. Confusing the two is the most common way people lose years.

Motivation shows up loudly and leaves quietly. It arrives after a good video, a hard conversation, a bad photo of yourself. It feels like fuel. It is not fuel — it is weather. You would not build a house on the assumption that it will not rain.

Discipline does not require you to feel anything. That is its entire value. It is a set of decisions you made once, in advance, so that the version of you at 5:40am with four hours of sleep does not get a vote.

Three things that make discipline hold:

**Decide once, not daily.** Every morning you re-negotiate is a morning you might lose. The training is not optional, so there is nothing to negotiate. This sounds rigid. It is actually the opposite — it frees up the energy you were spending on the argument.

**Make it smaller than your worst day.** Whatever you commit to should be survivable on the day everything goes wrong, because that day is coming. A habit that only works when your week is clean is not a habit, it is a hobby.

**Let the streak carry you.** There is a point where continuing is easier than breaking, purely because you do not want to be the person who broke it. That is not a trick. That is identity forming in real time.

You will still have days where you do it badly. Do it badly. Badly and done outranks well and skipped, every single time.$body$),

('The Standard You Keep Alone', $body$There are two versions of your standard: the one you perform, and the one you keep when there is no audience and no consequence.

Only the second one is real.

This is uncomfortable because most of us have quietly optimised for the first. We know which parts of our life are visible and we maintain those parts. The gym, because people see the results. The clothes, because people see the clothes. The output, because people see the output.

Then there is the rest. How you eat when nobody is at the table. Whether you actually read the thing or just bought it. Whether you finish the set when the timer is not running. Whether you tell the truth when the lie would cost you nothing.

Nobody is going to audit this. That is exactly the point.

The standard you keep alone is the one that determines what you are actually capable of, because it is the only one operating during the ninety percent of your life that nobody observes. You cannot perform your way to being someone. You can only be it repeatedly, mostly in private, until it stops feeling like effort.

A practical test, and it is a harsh one: pick the thing you would be most embarrassed for someone to see about your habits right now. Not your worst moment — your normal one. That is your real standard. Everything above it is presentation.

You do not fix this by feeling bad about it. You fix it by choosing one private thing and holding it for thirty days, with no plan to mention it to anyone.

Then you will know something about yourself that you cannot know any other way.$body$),

('Train for the Decade', $body$Almost every training plan you have seen was written for twelve weeks. Yours needs to survive ten years.

That single change in timeframe rewrites nearly every decision.

Over twelve weeks, intensity wins. You can push through, ignore niggles, run yourself down and still show a result at the end. Over ten years, intensity that outruns your recovery is just a slower way of stopping. The person still training at forty is almost never the person who trained hardest at twenty-five. It is the one who never got badly hurt and never fully quit.

What changes when you plan for a decade:

**You stop chasing failure on every set.** Leaving one or two in reserve costs you very little per session and saves you the injuries that cost months.

**You get boring on purpose.** Squat, hinge, push, pull, carry, run. The basics work indefinitely. Programme-hopping is usually just entertainment for a bored mind, and boredom is not the same as a plateau.

**You protect the habit above the session.** A missed week matters less than a lost identity. If life collapses, cut the session to fifteen minutes rather than to zero — the point is that you are still someone who trains.

**You take deloads before you need them.** The people who train longest are the ones who back off while still feeling strong, not the ones who back off because their body forced it.

None of this is soft. It is the harder discipline, because it means restraining yourself on the days you feel unstoppable — and those are the days it is genuinely difficult to hold back.

Ten years from now you will not remember any individual session. You will only be living in the body that all of them built.$body$),

('Recovery Is Part of the Work', $body$Rest is not the reward you get for training. It is the phase in which the training actually becomes something.

The session is a stimulus. That is all it is. You do not get stronger in the gym — you get damaged in the gym, and then you get stronger lying down, eating, and sleeping. Skip that half and you have done the damage without collecting the adaptation. You paid the cost and declined the return.

Most people know this and still treat recovery as the part you fit in around real life, because it does not feel like effort and nothing about it is impressive.

Handle three things and you have handled most of it:

**Sleep, seriously and not as a slogan.** It is the single largest lever, and nothing else you do compensates for missing it. Same time, dark room, no screen for the last stretch. Unglamorous, and it beats every supplement you could buy.

**Eat enough.** Chronic under-eating masquerades as discipline. It is not discipline, it is a slow-motion injury. If you are training hard and shrinking your intake at the same time, you are pulling in two directions and the body will pick.

**Take the easy days easy.** The purpose of an easy day is that it is easy. Turning every session into a hard session is not commitment, it is an inability to tolerate feeling unproductive.

There is a particular kind of person who finds this teaching harder than any training advice — someone whose sense of self is built on effort. Doing less feels like becoming less.

It is not. Recovery is not the absence of work. It is where the work lands.$body$),

('Build Something That Outlasts the Moment', $body$There is output, and there is an asset. They can look identical on the day you make them. Only one of them is still working for you a year later.

Output is consumed as it appears. A post, a shift, a favour, a piece of work delivered and forgotten. It can pay well. It can even feel like progress — output is highly visible, and visibility is easily mistaken for momentum. But it resets. Every month you start again from nothing, and the only way to earn more is to produce more.

An asset keeps returning value after the effort that made it has stopped. A skill you own. A body of work people can find. An audience that trusts you. A system that runs without you standing over it. A relationship where the trust is already established.

The uncomfortable part: assets are almost always slower and less satisfying to build, and nobody claps while you are building them. There is a long stretch where output would have paid better and felt better.

Some questions worth asking about anything you are spending real time on:

If I stopped today, does this keep producing anything at all?

Am I building a thing, or am I renting my hours out at a nicer rate?

Would this still matter in three years, or does it expire the moment attention moves?

None of this means never take the paying work. It means know which one you are doing, and do not let a decade of output convince you that you were building.

Most people are one asset away from a different life, and spend that life producing output instead.$body$),

('Leverage Over Hours', $body$You cannot out-work a bad structure. If the structure is wrong, more hours make the problem arrive faster.

This is the hardest lesson for disciplined people specifically, because effort has always been the answer. When something was not working, you worked harder, and mostly that succeeded. So when you hit something where effort is not the constraint, you apply the only tool you trust — and it does not move.

Leverage is what makes a unit of your effort produce more than one unit of result. There are only a few real kinds:

**Skill.** The same hour, executed by someone who is genuinely good, produces several times the output. Getting better is leverage, and it is the one most people underrate because it is slow and invisible from outside.

**Systems.** Anything you have done more than three times and are still doing manually is a decision to keep paying that cost forever. Write it down, automate it, or hand it over.

**Other people.** Not necessarily employees. Partners, collaborators, anyone whose strengths cover what you are worst at.

**Distribution.** The same work seen by ten people or ten thousand. This is why building an audience is not vanity — it is a multiplier on everything you make afterwards.

**Capital.** Money that works while you sleep, which is the only leverage that keeps running when you cannot.

The practical move is not to work less. It is to spend a fixed part of every week on the structure rather than inside it. An hour spent fixing how the work happens routinely beats ten more hours of doing it the current way.

Effort is not the enemy here. Unexamined effort is.$body$),

('Consistency Nobody Sees', $body$Every worthwhile thing has a middle, and the middle is where almost everyone quits.

The beginning is easy to romanticise. It is new, you can feel the change, and the story is fun to tell. The end is easy to imagine — that is the part you have been picturing all along.

The middle has neither. You are far enough in that it is no longer novel, and far enough from the result that it does not feel close. Progress has slowed to something you cannot detect week to week. Nobody is asking about it anymore. There is no applause, because from outside nothing appears to be happening.

This is the actual work. Not the start, not the finish. This.

What holds in the middle:

**Track something.** When you cannot feel progress, you need evidence of it. A streak, a log, a number that moves. Not for anyone else — so that on the day your gut says nothing is changing, you can check and see that it is.

**Lower the bar without lowering the standard.** The goal in the middle is not a great week. It is an unbroken one. Fifteen honest minutes on a bad day protects something that a skipped day quietly costs you.

**Stop asking whether it is working.** You will ask constantly. The answer is unavailable at this resolution. You are asking a question the timeframe cannot answer, and the asking itself is corrosive.

The people who make it through the middle are rarely the most talented or the most driven. They are the ones who found it acceptable to be unremarkable for a long time.

Consistency nobody sees is still consistency. The results arrive late, and then all at once, and everyone calls it luck.$body$),

('Sit With It', $body$Stillness is a skill. It responds to training the same way anything else does, and most people have never trained it once.

You can notice this in yourself quickly. Sit down with nothing — no phone, no music, no task — and see how long before the pull to fill the silence becomes physical. For most people it is well under a minute. That discomfort is not a personality trait. It is an untrained capacity, and it has consequences.

Almost every decision made badly is made while agitated. You reply too fast. You quit on a bad afternoon. You take the deal because sitting in the uncertainty felt worse than a mediocre resolution. The inability to sit with discomfort is quietly steering an enormous amount of your life.

Training it does not require any belief system. It is simple, and it is not easy:

**Sit still for ten minutes with no input.** Not to clear your mind — that is not the exercise, and chasing it will only frustrate you. Your mind will produce thoughts. The training is noticing you have been carried off and returning, and then doing that again. Every return is a repetition. The wandering is not failure; it is the resistance you are lifting against.

**Do one thing at a time on purpose.** Eat without a screen. Walk without headphones sometimes. Boredom is the entry point, not a sign it is not working.

**Do not resolve things immediately.** When something lands badly, let a night pass before acting. Most urgency is manufactured, and the version of you that responds tomorrow is better than the one who responds now.

What you are building is a gap between what happens and what you do about it.

Everything worth having lives in that gap.$body$),

('Standards Are a Form of Respect', $body$How you show up is information. You are giving it to people whether or not you meant to.

This is easy to dismiss as surface. The dismissal is usually a defence — it is more comfortable to decide appearances do not matter than to admit you let yours slide. But standards are not about impressing anyone. They are about what you are declaring, mostly to yourself.

Being on time says the other person's hours are worth the same as yours. Being dressed says the occasion registered. Keeping your space in order says you are someone whose environment reflects intention rather than accumulation. Answering the message says the relationship is real.

None of this is about expense. It is about care, and care is free. The most well-dressed person in a room is rarely the one who spent the most — it is the one whose choices look deliberate. A cheap thing worn well outranks an expensive thing worn carelessly, every time, and everyone can tell.

The internal effect matters more than the external one. Standards are a way of telling yourself what kind of operation you are running. It is very hard to hold a high standard in training and a collapsed one everywhere else — they leak into each other in both directions. People who let their surroundings go usually find their discipline goes shortly after, and they rarely connect the two.

Start with the things nobody grades. Make the bed. Fix the thing that has been broken for a month. Turn up early. Handle the small stuff you have been carrying.

Standards are not vanity. Vanity wants to be seen. Standards hold even when nobody is looking — which puts them much closer to discipline than to style.$body$),

('The Circle Sets the Ceiling', $body$You do not rise far past the standard of the people you spend your weeks with. Not because they hold you back deliberately — because they define what normal looks like, and almost nobody outperforms their sense of normal for long.

Your circle sets what is unremarkable. If everyone around you trains, training is not impressive, it is Tuesday. If everyone around you is building something, building is not ambitious, it is just what people do. The bar moves without anyone announcing it, and you move with it.

This works in both directions, which is the uncomfortable part. Ambition is contagious and so is drift. A circle where nobody is going anywhere makes going somewhere feel like a betrayal — not stated, but felt, in small comments and slight distance when you change.

Some of this you can act on directly:

**Be honest about who you are near.** Not who you like or have history with. Who you actually spend your hours around, because that is what shapes you.

**Add before you subtract.** You rarely need to cut people off. Mostly you need to add people who make your ambitions unremarkable, and let time redistribute your attention.

**Be the one who raises it.** Someone in every circle sets the standard. There is no rule that it cannot be you, and doing it deliberately is one of the few ways to improve a circle you do not want to leave.

**Let people see the real version.** A circle only lifts you if it knows what you are actually doing. Performance gets you admiration; honesty gets you accountability, and only one of those changes outcomes.

This is why MONARQ is invite-only, and why that is not a marketing decision. A circle is only worth being in if getting in meant something.$body$)

) as b(title, body)
join inserted on inserted.title = b.title;

-- Challenges -----------------------------------------------------------
-- Completion is self-declared (complete_challenge, 0032) — these are
-- framed so honest self-reporting is the only sensible reading.

insert into public.challenges
  (title, description, xp_reward, starts_at, ends_at, is_group, is_published)
values
  ('Seven Straight',
   $c$Check in every day for seven consecutive days. Not seven days out of ten — seven straight. If you break it, start the count again. The point is not the total, it is the unbroken line.$c$,
   100, date_trunc('day', now()), date_trunc('day', now()) + interval '90 days', false, true),

  ('The Silent Ten',
   $c$Ten days of showing up without telling anyone. No posts, no updates, no mentioning it. Log it here and nowhere else. Then decide honestly whether the work or the audience was the thing motivating you.$c$,
   150, date_trunc('day', now()), date_trunc('day', now()) + interval '90 days', false, true),

  ('Open the Circle',
   $c$Connect with two members and actually speak to them — not a request sent and forgotten. A circle you never use is just a list.$c$,
   75, date_trunc('day', now()), date_trunc('day', now()) + interval '90 days', true, true);
