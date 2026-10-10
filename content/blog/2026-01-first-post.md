---
title: I Built My Own Portfolio From Scratch (Vanilla is my fav flavour btw)
date: 2026-01-10
tags: intro, meta, dev, portfolio, behind-the-scenes
---

Hey, I'm Joe (aka coffeex86). I edit videos, I animate in 3D, and I write code. So when it came time to make a portfolio, I had a problem: every template out there looked like it was made for someone else. So I did the dramatic thing and built the whole site myself, from scratch. This is the story of how it went.

## First Epoch: no shortcuts

No website builders or bloat frameworks. Just plain HTML, CSS, and JavaScript, the stuff the internet is actually made of. It's a little like deciding to build a soldering iron instead of buying one. Slower? Yes. But I know where every single bolt is, and that means I can change anything I want, whenever I want.

Bonus: it's fully static, so there's no server to babysit. It just lives on GitHub Pages(may change tho) and works. No monthly bill or 3am "the server is down" panic.

## Second Epoch: The loading screen (my favorite thing, don't @ me)

Okay, I know. A loading screen is not a "need." But I'm a video editor, and I can't help it. The first second someone spends on a site is like the opening shot of a film. It sets the mood. So I made a custom loading screen (albeit simple) that lets you know the site hasn't crashed hehe.

Is it necessary? No. Do I stare at it on refresh sometimes? Also yes.

## Third Epoch: The hero that moves while you scroll

The top of the page isn't just sitting there. As you scroll, it smoothly transforms instead of snapping from one thing to the next. I wanted the page to feel less like a document and more like something that's alive and reacting to you.

I was gonna put a background video, but during production I decided maybe later.

And yes, I made it work on phones, which took some fighting. My text kept floating up top when I wanted it anchored at the bottom, no matter the screen size. A few lines of CSS and way too many tabs open later, it behaves.

## Fourth Epoch: Showing off the work

My stuff comes in a few flavors: videos, 3D, and code. Instead of dumping it all on one endless page, I made collapsible categories. Open the one you care about, skip the rest. If you're here to hire a video editor, you shouldn't have to scroll past my GitHub repos to get to the good stuff (but they're there if you're curious!).

## Fifth Epoch: A blog that runs on plain text

This post you're reading? It's a text file. I write in Markdown (the simple way of writing where `#` makes a heading), drop the file in a folder, and my site turns it into a nice-looking page. I wrote the little translator that does it myself. No database, no dashboard, no login. I write, I save, it's a blog post.

## Another Epoch(typing is tiring): The contact form (a.k.a. the boss fight)

When you hit send on my contact form, your message goes to two places at once: it pings my Discord, and it lands in a Google Sheet so I've got a neat record of everything. Each one works on its own, so if one fails, the other still goes through. Your message doesn't get lost just because one thing had a bad day.

It also has a sneaky hidden field that real people never see but spam bots love to fill in, which is how I quietly ignore the robots.

Was it smooth? Absolutely not. Google's security rules and my code had a very long argument that turned my browser console into a wall of red errors. I read, I tweaked, I tested, and eventually it clicked. I'll be honest, that moment of seeing my first test message pop up in Discord felt unreal.

## What I actually learned

- **Build the thing you can't find.** If a template existed that I loved, I'd have used it. Making it myself meant it actually sounds like me.
- **Details matter.** Loading screens, smooth scrolling, a form that doesn't break: people don't always notice good details, but they *feel* them.
- **Errors are just homework.** The red text is always trying to tell you something.

## So, want to work together?

That's what this whole site is really about. I like making things that look great, move well, and actually work, whether that's a video edit, a 3D animation, or a website that someone has to use at 2am on their phone. If you've got a project, or you just want to say hi, hit the contact form. It'll reach me, I promise. I tested it a *lot*.

Thanks for reading, and thanks for stopping by.

Joe