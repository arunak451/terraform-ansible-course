# Malli Akka Terraform + Ansible Class 🏗🤖

An Infrastructure as Code course for DevOps beginners. Malli Akka, an animated teacher avatar, explains Terraform and Ansible in Tanglish with kid-style analogies, with Tamil voice narration, the same format as the [Kubernetes course](https://kubernets.vercel.app).

- **12 Terraform lessons:** IaC basics, AWS setup, init/plan/apply, HCL + EC2, variables/outputs/locals, state & S3 backend, data sources & lifecycle, VPC networking, count/for_each, modules, workspaces/import/drift, CI/CD
- **6 Ansible lessons:** inventory & ad-hoc, playbooks & idempotency, variables/templates/handlers, roles & Galaxy, Vault & best practices, plus a Terraform + Ansible project
- **6 interview lessons:** Terraform vs Ansible, state problems, drift, failed applies, Ansible debugging, common questions
- Each lesson: 8 scenes; the board shows big text, lists, a fake terminal, and HCL/YAML explained line by line
- Practice terminal (4 simulated tasks per lesson), 5-question quiz, searchable cheat sheet, a 15-step project guide and a 29-question mock interview
- Progress is saved in localStorage; the layout works on mobile

## Layout

```
public/            ← the only folder Vercel serves (vercel.json → outputDirectory)
  index.html       player, practice, quiz, cheat sheet, project guide, mock interview
  lessons.js       18 core lessons  [subtitle, board]
  extras.js        interview lessons, practice tasks, quizzes
  project.js       project guide steps
  mock.js          mock interview questions
  durations.js     lesson lengths (generated)
  audio/           {lesson}-{scene}.mp3, mq-N.mp3, fx-*.mp3 (generated)
tools/             NOT deployed
  ta.mjs           Tanglish subtitle ➜ Tamil-script narration
  gen-audio.mjs    TTS: Sarvam (bulbul:v3, kavitha) or TTS=fish (Fish Audio free model)
  durations.mjs    measures audio ➜ public/durations.js
  check.mjs        validates lessons / practice regexes / quizzes
.env               SARVAM_API_KEY / FISH_API_KEY  (git-ignored, never deployed)
```

## Regenerating audio

```bash
cp .env.example .env    # add your key
node tools/gen-audio.mjs --print 5                 # preview the Tamil narration of lesson 5
TTS=fish node tools/gen-audio.mjs --only 5-3 --force
TTS=fish node tools/gen-audio.mjs --all
node tools/durations.mjs
node tools/check.mjs
```

## Deploy

Import this repo in Vercel (no build step; `vercel.json` serves `public/`).
