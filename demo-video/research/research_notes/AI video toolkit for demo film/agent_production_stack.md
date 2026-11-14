# Agent-driven production stack for a polished 2-minute film (state on 14 November 2026)

Reading notes for the report writer. Every page below was read on 14 Nov 2026 through an automated page reader, so re-check any number on the live page before money is spent. "Read 14 Nov 2026" means the page itself shows no date. Nothing was signed up for, logged into, installed, bought or called; the FAL_KEY on the machine was not used. The session's shared web-search budget ran out near the end, so a few items are listed as gaps instead of being checked. Licence readings are plain readings of public pages, not legal advice.

Strength of evidence. These pages were opened and read directly: fal (text-to-video catalogue, pricing, the Seedance 2.5, Wan 3.0, MiniMax H3, Gemini Omni Flash 1.2 and Kling 4.0 model pages, concurrency limits, MCP docs, Topaz generative endpoint, upscaler guide); Artificial Analysis (both boards); Replicate (video collection, pricing); OpenAI deprecations; Runware video page; WaveSpeed models; Kie market; Magnific API docs; Higgsfield MCP page; Runway MCP post; Gemini API pricing; Google's subscriptions post; Remotion docs (skills, licence pricing, licence FAQ, releases, GPU, gl options, hardware acceleration, effects, video tags, three, docs index); GitHub pages for HyperFrames, OpenMontage, davinci-resolve-mcp, OpenScreen, Motion Canvas and claude-code-video-toolkit; the HyperFrames MCP guide; ElevenLabs (agent tooling, music capability, music terms, API pricing); the StraySpark Blender article; the Blackmagic press release; the Digital Production and Puget Systems articles; Cap docs; the Screen Studio site; the DEV post; the ffmpeg filter reference. Every other link was seen only as a search-result summary and should be treated as a lead to verify.

## 1. API hubs: who carries the top video, image, lip-sync, upscaling, matting and audio models, and what is on no hub

### Takeaway
fal.ai has the widest verified reach across the current top API-available video models (Wan 3.0, MiniMax H3, Seedance 2.5, Gemini Omni Flash 1.2, Kling 4.0, FLUX 3 Max, Veo 3.1, Luma Ray 3.2) plus upscalers, lip-sync, matting, 3D and audio, so the fal key already on the Mac covers almost everything; Replicate or Runware fills the one clear hole (Runway Gen-4.5). The lead list in the brief is partly stale: Sora 2's API was shut down on 24 Sep 2026, Seedance is at 2.5, Kling at 4.0, and the #2 model on both quality boards (Utopai X) has no API at all.

### Cited Findings

#### Which video models lead right now
- Artificial Analysis text-to-video board (AA-Video-T2V v2.1, read 14 Nov 2026, no update date shown), with release month and the creator's own API price per minute of 1080p video: 1 Wan 3.0 (Alibaba, Elo 1175, Aug 2026, $12.00); 2 Utopai X (Utopai Studios, 1172, Sep 2026, "No API available"); 3 MiniMax H3 768p (1161, Jul 2026, $4.80); 4 Dreamina Seedance 2.5 (ByteDance, 1157, Jul 2026, $34.12); 5 Gemini Omni Flash 1.2 (Google, 1152, Nov 2026, $6.26); 6 FLUX 3 Max (Black Forest Labs, 1152, Oct 2026, $8.70); 7 HeyGen Video 1 (1151, Oct 2026, $2.40); 8 MiniMax H3 Max (1150, Aug 2026, $9.60); then FLUX 3, SkyReels V4, Seedance 2.0 (1135, Mar 2026, $22.45), P-Video-2-Pro, Gemini Omni Flash 1.1, Pika H3 Flex, Agnes-Video-2.5, Grok Imagine Video 1.5 (1055) — [Artificial Analysis T2V](https://artificialanalysis.ai/video/leaderboard/text-to-video)
- Artificial Analysis image-to-video board (AA-Video-I2V v2.1, read 14 Nov 2026): 1 Seedance 2.5 (1161); 2 Utopai X (1151, no API); 3 Seedance 2.0 (1141); 4 MiniMax H3 768p (1134); 5 SkyReels V4 (1125); 6 HeyGen Video 1 (1124); 7 Hyperflow H3 (1119); 8 P-Video-2-Pro (1117); 9 MiniMax H3 Max (1116); 10 Pika H3 Flex (1114); 11 Wan 3.0 (1109); 14 Gemini Omni Flash 1.2 (1085); 15 FLUX 3 (1069); 20 Vidu Q4 Preview (1032) — [Artificial Analysis I2V](https://artificialanalysis.ai/video/leaderboard/image-to-video)
- Neither top-20 list, as extracted, contains Kling 4.0, Kling 3.0, Veo 3.1, Runway Gen-4.5 or Luma Ray 3.2 — [Artificial Analysis T2V](https://artificialanalysis.ai/video/leaderboard/text-to-video); [Artificial Analysis I2V](https://artificialanalysis.ai/video/leaderboard/image-to-video)
- Sora 2 is gone: OpenAI's deprecations page lists the Videos API, `sora-2`, `sora-2-pro` and their dated snapshots with notice date 24 Mar 2026, shutdown date 24 Sep 2026 and replacement "No one-to-one replacement"; no newer OpenAI video model is named — [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations)
- Utopai X is offered only inside Utopai's own PAI platform, with no public API; it is described as a post-train of MiniMax H3, and a guide updated 15 Oct 2026 says it costs 93 credits per second at 1080p (no dollar price per credit found) — [OrcaRouter blog](https://www.orcarouter.ai/blog/utopai-x-debut); [Layer3 Labs guide](https://www.layer3labs.io/guides/utopai-pai-explained)

#### fal.ai (key already on the Mac)
- The text-to-video catalogue (143 results, read 14 Nov 2026) lists on page 1: fal's H3 Max and H3 Max Turbo (MiniMax H3 variants), FLUX 3 Max ("new"), Kling 3.0 Pro and Standard, Kling 4.0 ("new"), Kling O3, Kling 2.6 Pro, Kling 2.5 Turbo Pro, Kling LipSync, Seedance 2.5 (US-hosted endpoint `bytedance/seedance-2.5/us/text-to-video`), Seedance 2.0 Fast and Mini, Wan 3.0 and Wan 3.0 Prime, Gemini Omni Flash 1.2 ("new") and 1.1, MiniMax H3, Grok Imagine Video 1.5 and Lite, PixVerse v6, HeyGen Video ("new", built on MiniMax H3), FLUX 3; Veo 3.1 appears in the page text — [fal text-to-video catalogue](https://fal.ai/explore/text-to-video-apis)
- Seedance 2.5 on fal: about $0.2205/s at 480p, $0.4730/s at 720p, $1.164/s at 1080p (token pricing $0.0214 per 1,000 tokens at 480p/720p, about $0.0234 at 1080p; tokens ≈ height × width × duration × 24 / 1024); 4 to 30 s clips; native audio on by default at the same price; a draft option makes a 480p preview that can be completed at 1080p within 7 days — [fal Seedance 2.5 model page](https://fal.ai/models/bytedance/seedance-2.5/us/text-to-video/llms.txt)
- Wan 3.0 on fal: $0.05/s at 480p, $0.10/s at 720p, $0.20/s at 1080p; 2 to 30 s; native audio on by default — [fal Wan 3.0 model page](https://fal.ai/models/alibaba/wan-3.0/text-to-video/llms.txt)
- MiniMax H3 on fal: $0.05/s at 480p, $0.06/s at 768p, $0.13/s at 2K, $0.16/s at 4K (2K and 4K are upscales of a 768p base); 5 to 15 s; native audio not stated — [fal MiniMax H3 model page](https://fal.ai/models/minimax/h3/text-to-video/llms.txt)
- Gemini Omni Flash 1.2 on fal: $0.0273/s at 360p, $0.0819/s at 720p, $0.1229/s at 1080p, $0.2457/s at 4K, native audio included; 3 to 15 s; 16:9 and 9:16 only — [fal Gemini Omni Flash 1.2 model page](https://fal.ai/models/google/gemini-omni-flash/v1.2/text-to-video/llms.txt)
- Kling 4.0 on fal: $0.157/s at 720p, $0.235/s at 1080p; 3 to 30 s; per-shot prompts for multi-shot clips; audio pricing not stated — [fal Kling 4.0 model page](https://fal.ai/models/kling/v4/text-to-video/llms.txt)
- Other fal video prices on the pricing page (read 14 Nov 2026): FLUX 3 Max $0.085/s; H3 Max $0.05/s; H3 Max Turbo $0.025/s; Kling v3 Pro and Standard both shown at $0.14/s; Kling O3 $0.14/s; Kling 2.6 $0.07/s; Grok Imagine Video $0.05/s and 1.5 $0.01/s; PixVerse V6 $0.005/s; Seedance 2.0 Fast $0.0112 and Mini $0.007 per 1,000 tokens — [fal pricing](https://fal.ai/pricing)
- Veo 3.1 on fal is quoted at $0.40/s for 720p/1080p with audio — [fal text-to-video catalogue](https://fal.ai/explore/text-to-video-apis)
- Luma Ray 3.2 is on fal (text-to-video, image-to-video, video-to-video, reframe), about $0.50 for a 5 s 540p clip; a search found no fal endpoint for Runway Gen-4.5 — [fal Luma Ray 3.2 model page](https://fal.ai/models/luma/agent/ray/v3.2/text-to-video/llms.txt)
- Billing: prepaid credits; "You are not charged for server errors or for time spent waiting in the queue"; current prices per endpoint live at `https://fal.ai/models/<endpoint-id>/llms.txt` — [fal pricing](https://fal.ai/pricing)
- Concurrency: every new account starts at 2 concurrent requests; the limit rises automatically with paid invoices over the last four weeks, self-serve up to 40; above 40 needs sales; only `IN_PROGRESS` requests count; extra requests wait in the queue and are never rejected for concurrency (unless a `start_timeout` expires); fal may add extra limits on high-demand models — [fal concurrency limits](https://fal.ai/docs/documentation/model-apis/concurrency-limits)
- None of the five fal model pages read states a licence or commercial-use term for outputs — [fal Seedance 2.5 model page](https://fal.ai/models/bytedance/seedance-2.5/us/text-to-video/llms.txt); [fal Wan 3.0 model page](https://fal.ai/models/alibaba/wan-3.0/text-to-video/llms.txt)

#### Replicate
- The text-to-video collection (read 14 Nov 2026) lists kwaivgi/kling-v4.0, kling-v4-flash, kling-v3-video and kling-v3-omni-video, alibaba/wan-3, minimax/h3-lite and h3-highspeed, google/gemini-omni-1.2-flash, google/veo-3.1 and veo-3.1-fast, bytedance/seedance-2.0 and 2.0-fast, runwayml/gen-4.5 (498.7K runs), luma/ray-3.2, xai/grok-imagine-video-1.5, pixverse-v6 and v6-max, prunaai/p-video-2-pro-reference, veed/fabric-1.0, bytedance/dreamactor-m2.0; Seedance 2.5 is not in the list as extracted — [Replicate text-to-video collection](https://replicate.com/collections/text-to-video)
- Replicate's pricing page gives no rate or concurrency numbers; it mentions enterprise volume discounts and a banner saying MiniMax H3 Lite and Highspeed are 50% off "until end of year" — [Replicate pricing](https://replicate.com/pricing)

#### Rivals
- Runware's video page lists Wan 3.0, Wan 3.0 Prime, Seedance 2.0, Veo 3.1, PixVerse V6, Grok Imagine Video, Hailuo 2.3, Sync lipsync-2-pro and Topaz Proteus; Seedance 2.5, MiniMax H3, Kling 4.0 and Gemini Omni appear only in its navigation; it claims "production-grade concurrency without an enterprise contract" with no numbers; Sora is absent — [Runware video API](https://runware.ai/video-generation-api)
- Runware also documents Runway Gen-4.5 (about $0.965 per run) and Luma Ray 3.2 — [Runware Gen-4.5 docs](https://runware.ai/docs/models/runway-gen-4-5); [Runware Ray 3.2 docs](https://runware.ai/docs/models/luma-ray3-2)
- WaveSpeed's model page lists Seedance 2.5 ($0.3240, unit not stated), Seedance 2.5 Flash ($0.2160), Wan 3.0 ($0.0950), Wan 3.0 Prime ($0.1425), Kling V4.0 ($0.1335), MiniMax H3 ($0.0400, per second), plus Veo 3.1, Grok Imagine 1.5, Vidu Q4 without prices; Sora and Gemini Omni are not mentioned; it promises "one rate-limit envelope across every model" with no numbers — [WaveSpeed models](https://wavespeed.ai/models)
- Kie's market page lists Seedance 2.5 and 2.0, Wan 3.0, Veo 3.1, Gemini Omni 1.2 Flash, Grok Imagine 1.5, Kling 4.0 and 4.0 Flash, PixVerse V6 Max, Vidu Q4, OmniHuman 2.0; images GPT Image 2 and 2.6, Seedream 5.0 Pro and 5.5, Nano Banana 2 and Pro, Flux 3; and a "Suno API" at V5.5; no prices on that page — [Kie market](https://kie.ai/market)
- Krea says it offers "40+ image and video models, one REST API" with compute-unit pricing, and hosts a Topaz Astra endpoint — [Krea API](https://krea.ai/features/api); [Krea Topaz Astra docs](https://www.krea.ai/docs/api-reference/video-enhance/topaz-astra)
- Together announced video generation in October 2025 (example $0.57 per 1080p 5 s video); no 2026 model list was found — [Together blog](https://www.together.ai/blog/40-new-image-and-video-models)
- The old Freepik API docs address now redirects to "Magnific API" docs, which list Mystic (image), Image Upscaler Creative, Kling v3 (image to video) and a hosted Magnific MCP server needing no API key — [Magnific API docs](https://docs.magnific.com/introduction); contradicted by a competitor post claiming Freepik has no public API — [WaveSpeed blog](https://wavespeed.ai/blog/posts/freepik-ai-review-2026)
- Higgsfield runs an official hosted MCP server at `https://mcp.higgsfield.ai/mcp` ("35+ models and tools for image and video generation", "no API key required", about 69 workflow presets); the page names no models or prices — [Higgsfield MCP page](https://higgsfield.ai/mcp)
- Runway's official MCP server (announced 27 May 2026) is at `https://mcp.runwayml.com/mcp`, signs in with a Runway account, bills to the Runway plan, and exposes Gen-4.5, Seedance 2.0, GPT Image 2, Kling 3.0, Nano Banana Pro "and more" — [Runway MCP announcement](https://runway.com/news/mcp)
- Google's own Gemini API price page lists `gemini-omni-1.2-flash` at about $0.023/s (360p), $0.07/s (720p), $0.104/s (1080p upsampled) and $0.209/s (4K upsampled); `gemini-omni-1.1-flash` requests route to 1.2 from 3 Dec 2026 — [Gemini API pricing](https://aistudio.google.com/docs/pricing)
- No Google Flow API or MCP server was found; Flow access is through consumer plans — [Flowith guide, 30 Jul 2026](https://flowith.io/blog/gemini-omni-flash-product-vs-api-access-guide/)

#### Lip-sync, upscaling, matting, images, 3D and audio on fal
- Lip-sync on fal: Sync lipsync-2 at $3 per minute of video and lipsync-2-pro at $5 per minute; VEED Fabric 1.0 at $0.08 to $0.15 per second; OmniHuman at $0.14 per second (search snippets of fal pages, not opened one by one) — [fal Sync lipsync 2.0](https://fal.ai/models/fal-ai/sync-lipsync/v2/llms.txt); [fal VEED Fabric 1.0](https://fal.ai/models/veed/fabric-1.0); [fal OmniHuman](https://fal.ai/models/fal-ai/bytedance/omnihuman)
- Matting and segmentation on fal: Video Background Removal $0.008 per 30 frames; Bria RMBG 2.0 $0.018 per generation; Segment Anything Model 3 $0.005 per unit — [fal pricing](https://fal.ai/pricing)
- Images on fal: Nano Banana Pro $0.15 per image, Nano Banana 2 $0.08, Seedream 5.0 Pro $0.0675 per unit, FLUX 2 $0.012 per megapixel, GPT Image 2 and Nano Banana 2.1 shown at "$1 per unit" (unit unclear) — [fal pricing](https://fal.ai/pricing)
- 3D asset models on fal: Hunyuan3D V3 $0.015 per unit, Trellis 2 $0.05, Tripo H3.1 $0.01 per credit, Hyper3D Rodin V2.5 $0.4 per generation, Meshy 6 $0.8 per generation — [fal pricing](https://fal.ai/pricing)
- Audio on fal: Lyria 3 Pro $0.08 per audio, MiniMax Music $0.03 per generation, Sonilo V1.1 text-to-music $0.0025/s and text-to-sound-effects $0.0018/s, ACE Step $0.0002/s, Gemini 3.1 Flash TTS $0.05 per 1,000 characters — [fal pricing](https://fal.ai/pricing)

#### Typical wait
- One published Replicate run of Seedance 2.5 took about 224 seconds of predict time for a 5 s 720p clip, queue time excluded; the same vendor post says no provider publishes numeric Seedance 2.5 rate limits — [Atlas Cloud blog](https://www.atlascloud.ai/blog/tips/fastest-seedance-2-5-api-providers-speed-queue-time); [Atlas Cloud rate-limit post](https://www.atlascloud.ai/blog/guides/seedance-2-5-api-rate-limits-concurrency-comparison)
- fal's MCP `run_model` waits up to 45 seconds by default and then returns a request id; long jobs should use `submit_job`, `check_job`, `get_job_result` and must not be resubmitted to check progress, since that creates a new billable job — [fal MCP docs](https://fal.ai/docs/model-apis/mcp)

### Inferences
- Coverage matrix assembled from the pages above ("not seen" means not on the page read, not proof of absence):

| Model (AA rank T2V / I2V) | fal | Replicate | Runware | WaveSpeed | Kie | Own route |
|---|---|---|---|---|---|---|
| Wan 3.0 (1 / 11) | yes | yes | yes | yes | yes | Alibaba |
| Utopai X (2 / 2) | no | no | no | no | no | PAI web platform only |
| MiniMax H3 (3 / 4) | yes (H3, H3 Max, Turbo) | yes (Lite, Highspeed) | nav only | yes | image model only seen | MiniMax |
| Seedance 2.5 (4 / 1) | yes (US-hosted) | not in list read | nav only | yes | yes | BytePlus |
| Gemini Omni Flash 1.2 (5 / 14) | yes | yes | nav only | not seen | yes | Gemini API (key on the Mac) |
| FLUX 3 Max (6 / 16) | yes | not seen | FLUX 3 Video | not seen | image only seen | BFL |
| HeyGen Video 1 (7 / 6) | yes | not seen | not seen | not seen | not seen | HeyGen |
| Kling 4.0 (outside top 20) | yes | yes | nav only | yes | yes | Kling |
| Veo 3.1 (outside top 20) | yes | yes | yes | listed, no price | yes | Gemini API |
| Runway Gen-4.5 | not found | yes | yes | logo only | link only | Runway API or MCP |
| Luma Ray 3.2 | yes | yes | yes | logo only | filter only | Luma |
| Sora 2 | gone | gone | gone | gone | gone | API shut down 24 Sep 2026 |

- Recommended hub stack: fal as the single main hub (it carries all 7 API-available models in the AA text-to-video top 8; the eighth, Utopai X, has no API; the only lead from the brief missing on fal is Runway Gen-4.5); the Gemini API key already on the Mac for Gemini Omni Flash 1.2, which is about 15% cheaper direct ($0.07/s vs $0.0819/s at 720p; $0.104/s vs $0.1229/s at 1080p); Replicate or Runway's own MCP only if a Runway Gen-4.5 look is wanted.
- Models that need their own key or a web UI: Utopai X (web platform only, so only a computer-use session can drive it); Runway Gen-4.5 (Runway account or Replicate/Runware key); Google Flow features (web UI); Higgsfield presets (Higgsfield plan through its MCP). Sora 2 no longer exists as an API.
- Corrections to the brief's lead list: "Seedance 2.x" is now 2.5 (Jul 2026); "Kling 3.x" is now Kling 4.0; "Veo 3.x" is still 3.1 but Google's higher-ranked model is Gemini Omni Flash 1.2 (Nov 2026); "Sora 2" is shut down; "MiniMax H3", "Wan 3.0", "Runway" (Gen-4.5) and "Luma" (Ray 3.2) are current.
- The AA "creator API price" lines up with hub prices in places (Wan 3.0 $12.00/min equals fal's $0.20/s at 1080p; Omni Flash 1.2 $6.26/min equals Google's $0.104/s at 1080p) and not in others (Seedance 2.5: AA $34.12/min is about $0.57/s, between fal's 720p and 1080p prices; the fal endpoint is a US-hosted variant, which may carry a premium).
- Derived with the token formula on the Seedance 2.5 page (assuming it also applies to 2.0): Seedance 2.0 Fast is about $0.24/s and Mini about $0.15/s at 720p.
- A new or low-spend fal account runs only 2 jobs at once. At about 224 s per Seedance 2.5 take, 161 takes need about 5 hours and 380 takes about 12 hours at concurrency 2; buying credits early raises the limit (up to 40).

### Gaps
- Commercial-use terms for outputs of each model on fal and Replicate were not found on the model pages; the hubs' terms of service and each model vendor's terms were not read.
- Replicate's rate limits and per-model video prices were not on the pages read. Seedance 2.5 on Replicate is unconfirmed (a third-party post cites a Replicate run; the collection list read does not show it).
- Whether fal carries Runway Gen-4.5 was checked by one search only. Hub availability of SkyReels V4, P-Video-2-Pro, Hyperflow H3 and Pika H3 Flex was not checked.
- WaveSpeed's price units are not stated on the page read, so its apparent discount on Seedance 2.5 is unverified.
- Midjourney's video model and API status were not checked (search budget exhausted).
- Real queue waits per model on fal were not found; only one published run time for Seedance 2.5 exists in the sources read.
- Veo 3.1's price on Google's own API page was not captured (the section was outside the text read).

## 2. Agent skills, plugins and MCP servers for video work in Claude Code

### Takeaway
The official, maintained pieces worth having are Remotion's Agent Skills, ElevenLabs' skills, fal's command-line tool or remote MCP, and (only if those tools are adopted) HyperFrames' skills, Blender Lab's MCP server and the AI-assistant link built into DaVinci Resolve Studio 21.1. Most of them add current rules, model ids and job handling rather than new abilities; the "do everything" frameworks (OpenMontage and similar) have no independent proof of polished output, and community skills and MCP servers carry real supply-chain risk.

### Cited Findings

#### Remotion Agent Skills (official)
- Remotion maintains 13 Agent Skills (`/remotion-best-practices`, `-create`, `-markup`, `-studio`, `-render`, `-maps`, `-captions`, `-saas`, `-interactivity`, `-docs`, `-license` from v4.0.540, `-upgrade`, `-multimedia`); install with `npx remotion skills add` inside a project, or `npx skills add remotion-dev/skills`; source lives in the Remotion monorepo under `packages/skills`; Claude Code, Codex, Cursor, Kimi Code and OpenCode are named — [Remotion skills docs](https://www.remotion.dev/docs/ai/skills)
- A mirror of the skill's 3D rule says no animation is allowed unless driven by `useCurrentFrame()`, otherwise renders flicker — [mirror of remotion-best-practices 3D rule](https://docs.creem.io/.cursor/skills/remotion-best-practices/rules/3d.md)

#### HeyGen HyperFrames (official)
- GitHub repo heygen-com/hyperframes: 84.1k stars, 7.8k forks, 108 open issues, 7,152 commits, Apache-2.0; "a free, open-source framework for turning HTML, CSS, media, and seekable animations into deterministic MP4 videos"; renders by seeking each frame in headless Chrome and encoding with FFmpeg; needs Node 22+ and FFmpeg; 9 skills (`/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`, `/reverse-any-video`, `/style-sampling`, plus `/figma`, `/slideshow`, `/remotion-to-hyperframes`); installs by `npx skills add heygen-com/hyperframes` or as a Claude Code plugin (`claude plugin marketplace add heygen-com/hyperframes`) — [HyperFrames GitHub](https://github.com/heygen-com/hyperframes)
- The hosted HyperFrames MCP (`https://mcp.heygen.com/mcp/hyperframes/`, beta) renders on HeyGen's servers, needs a HeyGen account with OAuth, and is aimed at chat products; local rendering does not need it, and only the local path offers frame-rate choice, 4K and WebM or MOV output — [HyperFrames MCP guide](https://hyperframes.heygen.com/guides/mcp)

#### OpenMontage and other "director" frameworks
- GitHub repo calesthio/OpenMontage: 80.4k stars, 10.8k forks, 98 open issues, 244 open pull requests, AGPL-3.0; 11 pipelines in its table (explainer, animation, avatar, cinematic, clip factory, documentary montage, hybrid, localization, podcast repurpose, screen demo, talking head); the coding agent is the orchestrator, reading YAML pipeline manifests and Markdown stage skills and calling Python tools; providers include fal, Higgsfield, HeyGen, Runway, Veo 3.1, Seedance, ElevenLabs and Suno; composition through Remotion, HyperFrames and FFmpeg; needs Python 3.10+, Node 22+ and FFmpeg — [OpenMontage GitHub](https://github.com/calesthio/OpenMontage)
- Two source-level reviews say they did not run a production; one found that configuring a budget does not automatically cap every paid call and that the human-approval flag is supplied by the caller; no independent hands-on quality test was found — [Wavect review](https://wavect.io/blog/openmontage-ai-video-production-review/); [PromptQuorum review](https://www.promptquorum.com/power-local-llm/openmontage-review)
- The one hands-on account found (DEV post dated 1 Jul, year not shown) used OpenMontage with another agent: subtitles dumped the whole script with raw tokens, text drifted out of sync, typography "looked like a PowerPoint slide", the agent stalled on a hidden permission prompt and patched OpenMontage's source; the author's verdict was "80% of the way there for 1% of the cost" and "an art school video project" — [DEV post](https://dev.to/thephilgray/i-used-an-ai-agent-to-make-a-product-video-the-cost-was-0-but-theres-a-catch-5761)
- ViMax (HKUDS, MIT) is a multi-agent framework with screenwriter, storyboard and character-consistency agents and a June 2026 paper; it orchestrates commercial image and video models — [ViMax GitHub](https://github.com/HKUDS/ViMax); [ViMax paper](https://arxiv.org/html/2606.07649v1)
- digitalsamba/claude-code-video-toolkit: 2.6k stars, 449 forks, MIT, newest example dated 12 Nov 2026; skills for remotion, elevenlabs, ffmpeg, playwright-recording, video-design and an experimental blender skill; commands such as `/video`, `/record-demo`, `/scene-review`, `/generate-voiceover`; its framing is "Claude Code is the builder. You are the director, editor, and designer" — [claude-code-video-toolkit GitHub](https://github.com/digitalsamba/claude-code-video-toolkit)

#### fal
- Official remote MCP server at `https://mcp.fal.ai/mcp-relay` (add with `claude mcp add --transport http --scope user fal https://mcp.fal.ai/mcp-relay`, then sign in through `/mcp` with OAuth; no API key); tools: `search_models`, `get_model_schema`, `recommend_model`, `search_docs`, `get_pricing`, `run_model`, `submit_job`, `check_job`, `get_job_result`, `cancel_job`, `upload_file` (local files up to 90 MB by signed upload); the server is free; prompts ask for cost approval "but there's no server-side approval gate"; the docs page mentions no official skills — [fal MCP docs](https://fal.ai/docs/model-apis/mcp)
- fal's separate `genmedia` command-line tool installs with `curl https://genmedia.sh/install -fsS | bash`, sets up non-interactively with an API key, prints structured JSON, covers 1,000+ models and can install an agent skill bundle (`genmedia init`); its repo is MIT; released binaries send anonymous usage analytics through PostHog — [fal genmedia docs](https://fal.ai/docs/documentation/setting-up/genmedia)

#### ElevenLabs
- Official skills (`npx skills add elevenlabs/skills`): text to speech, speech to text, sound effects, music, voice changer, voice isolator, agents and setup; official remote MCP server at `https://api.elevenlabs.io/v1/mcp` with OAuth sign-in — [ElevenLabs agent tooling](https://elevenlabs.io/docs/eleven-api/resources/agent-tooling)

#### Runway, Higgsfield, Google Flow
- Runway's hosted MCP (27 May 2026) and Higgsfield's hosted MCP are both official and tie generations to the user's paid plan — [Runway MCP announcement](https://runway.com/news/mcp); [Higgsfield MCP page](https://higgsfield.ai/mcp)
- A separate Runway developer MCP at `dev.runwayml.com/mcp` (OAuth, billed to a Runway developer account) is reported by a newsletter, not seen on Runway's own page — [AlphaSignal](https://alphasignal.ai/news/runway-dev-mcp-lets-ai-coding-agents-control-generative-media-apis-directly)
- No Google Flow MCP or API was found — [Flowith guide, 30 Jul 2026](https://flowith.io/blog/gemini-omni-flash-product-vs-api-access-guide/)

#### Blender
- An official Blender Lab MCP server exists: v1.0.0 on 27 Apr 2026, v1.0.3 on 11 Sep 2026, needs Blender 5.1+, GPL-3.0-or-later, 26 tools (code execution, blend-file summaries, screenshots, viewport renders, searches of the bundled Python API reference and manual), six with `_for_cli` variants that open files in background Blender processes; Blender Lab warns it runs model-written code "without any guards in place" and recommends a virtual machine (article by a vendor of a competing paid server, published 25 Sep 2026, updated 3 Nov 2026) — [StraySpark comparison](https://www.strayspark.studio/blog/official-blender-mcp-server-comparison-2026)
- The well-known community server was renamed "MCP for Blender" (`ahujasid/mcp-for-blender`) on 16 Sep 2026; about 29,326 stars on 25 Sep 2026; MIT; 36 tools; four CVEs published against it in 2026; safe mode is opt-in (`BLENDER_MCP_SAFE_MODE=1`); its socket has no authentication or encryption; minimal telemetry is on by default — [StraySpark comparison](https://www.strayspark.studio/blog/official-blender-mcp-server-comparison-2026)

#### DaVinci Resolve
- DaVinci Resolve 21.1 (8 Sep 2026) "now supports integration with AI assistants such as Claude, Claude Code and ChatGPT Codex" and adds 20 new scripting APIs — [Blackmagic press release](https://www.blackmagicdesign.com/media/partial/release/20260908-03)
- The link is an MCP server set up through File > Setup AI Assistants and is a Studio feature; Blackmagic's example is cutting a long clip to a three-minute highlight edit, removing edits shorter than one second and rendering H.265; the article notes Blackmagic does not explain permissions, safeguards for destructive actions or logging — [Digital Production, 8 Sep 2026](https://digitalproduction.com/2026/09/08/resolve-21-1-adds-mcp-and-finally-gets-presets/)
- Free-edition scripting: Puget Systems says 21.1 "entirely removed" scripting from the free edition, quoting Blackmagic that "The Python API was being used to hack studio features into the free version" — [Puget Systems, 10 Sep 2026](https://www.pugetsystems.com/blog/2026/09/10/how-davinci-resolve-free-v21-1-scripting-changes-affect-puget-bench/); contradicted in part by Digital Production, which says console scripting remains in the free edition while external scripting needs Studio — [Digital Production, 8 Sep 2026](https://digitalproduction.com/2026/09/08/resolve-21-1-adds-mcp-and-finally-gets-presets/)
- Community server samuelgursky/davinci-resolve-mcp: 4.1k stars, 474 forks, MIT, v5.2.9, 5 open issues; 37 tools in its default server and 390 in the granular one; tested on Resolve 19.1.3, 20.3.2 and 21.0.2 Studio; its README says it does not choose the best take, judge a cut or replace an editor — [davinci-resolve-mcp GitHub](https://github.com/samuelgursky/davinci-resolve-mcp)

#### After Effects, Premiere, CapCut
- Only community After Effects MCP servers were found (ExtendScript bridges that need a panel running inside the app); no official Adobe MCP for After Effects or Premiere turned up — [kumoproductions/mcp-aftereffects](https://github.com/kumoproductions/mcp-aftereffects); [a-y-ibrahim/after-effects-mcp](https://github.com/a-y-ibrahim/after-effects-mcp); [Aodaruma/adobe-mcp-rs](https://github.com/Aodaruma/adobe-mcp-rs)
- CapCut has no official API or MCP; community tools (VectCutAPI, 2,232 stars, Apache-2.0, last push 12 Sep 2026) write draft files that a person still opens in CapCut to export (guide checked 19 Sep 2026) — [AITuber guide](https://aituber.app/blog/capcut-mcp-claude/)

#### Security
- 2026 research on public agent skills, as relayed by secondary coverage: Snyk scanned 3,984 skills and reported 13.4% with critical issues and 76 confirmed malicious payloads, 91% of which paired malware with prompt injection; Mobb.ai audited 22,511 skills with 140,963 findings; Unit 42 (11 Jun 2026) crawled 49,943 skills; OWASP published an Agentic Skills Top 10 in April 2026; a skill that passes review can later be updated with malicious content — [Snyk article](https://snyk.io/articles/skill-md-shell-access/); [The New Stack](https://thenewstack.io/ai-agent-skills-security/); [Obot blog](https://obot.ai/blog/mcp-security-agent-skills-supply-chain/); [Forkast](https://forkast.news/?p=130453)

### Inferences
- Worth installing for this film: Remotion Agent Skills (official, in the monorepo, version-matched to the project; they encode render rules an agent otherwise gets wrong, such as frame-driven animation); ElevenLabs skills (official; mostly current model ids and parameters); fal `genmedia` CLI or plain REST calls with the key (best for scripted batches of takes), with the fal remote MCP as an optional helper for model discovery, schemas and live prices.
- What each adds over the agent writing code: Remotion and HyperFrames skills add house rules and lint; fal MCP adds search, schema and price lookup plus queue handling, but spends money with no server-side gate and uses a browser sign-in account rather than the local key; ElevenLabs skills add little beyond the API docs; the Resolve and Blender MCP servers add live inspection (screenshots, timeline state) that code alone cannot give; OpenMontage adds pipeline manifests, checkpoints and self-review, but its quality claims are unproven and its code is AGPL-3.0.
- Conditional installs: HyperFrames skills only if HyperFrames is chosen as the composition engine; Blender Lab's official MCP only if Blender is added, and then inside a virtual machine or throwaway user, or skip the MCP and run plain headless Python scripts; Resolve's built-in assistant link only if Resolve Studio is bought and a person or computer-use session opens the app.
- Skip: After Effects and Premiere servers (apps not installed, community-only), CapCut draft writers (a person must still export), the community Blender server without safe mode, and any skill from an aggregator listing whose publisher cannot be traced to the vendor's own repository.
- Security practice that follows from the findings: install skills only from the vendor's own repository, read each SKILL.md and script before use, pin versions, keep hosted MCP servers that can spend money (fal, Higgsfield, Runway) behind a budget the agent cannot raise, and note that the HyperFrames hosted MCP and any hosted generator send project content to a third party.
- Maturity ranking by the evidence found: Remotion skills (official, shipped with a release train that had 7 releases between 19 Oct and 11 Nov 2026) and ElevenLabs tooling are mature; HyperFrames is very active but young (README says inspired by Remotion; 167 open pull requests); OpenMontage is popular but unproven; Blender Lab's MCP is at 1.0.3 with an explicit no-sandbox warning; Resolve's link is two months old with undocumented safeguards.

### Gaps
- No independent, hands-on write-up dated September to November 2026 of a full film built by a coding agent was found; the nearest are the 1 Jul DEV post, vendor guides and source-only reviews.
- The fal-ai-community/skills repository's ownership was not verified (fal's own docs point to `genmedia skills install` instead).
- Tool lists for the Higgsfield, Runway and HyperFrames hosted MCP servers, and their per-generation credit costs, are not published on the pages read.
- The attribution of each security statistic to its original report was not verified; the numbers come through secondary articles.
- The browser-use/video-use project surfaced only as a search title and was not read.

## 3. Code-driven motion graphics: Remotion versus HyperFrames versus Motion Canvas versus Theatre.js, and what looks premium

### Takeaway
Remotion (v4.0.543, 11 Nov 2026) is the strongest base for an agent: it now ships a GPU effects library, a WebGPU three.js canvas, a fast frame-accurate video tag and official skills, but an employee of a large company needs a paid Company Licence (Creators seat, $25 per month per person; the agent itself needs no seat). HyperFrames is the licence-free alternative (Apache-2.0, HTML plus GSAP); Motion Canvas is alive but quieter and Theatre.js looks unmaintained.

### Cited Findings

#### Remotion version and features
- Latest release is v4.0.543 (11 Nov); the last seven releases ran from v4.0.537 (19 Oct) to v4.0.543 — [Remotion releases](https://github.com/remotion-dev/remotion/releases)
- Recent additions: effects `cylinder()`, `sphere()`, `pageTurn()`, `fractalNoise()`, `turbulentDisplace()`, `lensBlur()`, `bevelAlpha()` (v4.0.537); `curves()` colour control and `shatter()` (v4.0.539); WebGPU and WebGL2 backends across the effects library, weather, burn and wipe effects, Chrome 158 (v4.0.540); `magnify()` and `lightning()` effects, OpenTimelineIO import in Studio (v4.0.542); audio level meters in Studio, `open-timeline import` and `canvas-capture import` commands, and a note that remotion.pro is retired (v4.0.543) — [Remotion releases](https://github.com/remotion-dev/remotion/releases)
- `@remotion/effects` (from v4.0.464) applies chains of pixel effects through an `effects` prop on `<Solid>`, `<HtmlInCanvas>`, `<Video>`, `<Img>`, `<Gif>`, `<RemotionRiveCanvas>` and shapes; custom effects via `createEffect()` can use 2D canvas, WebGL2 or WebGPU; an agent with Remotion Skills can be asked to add one — [Remotion effects docs](https://www.remotion.dev/docs/effects)
- `@remotion/three` provides `<ThreeCanvas>` (React Three Fiber with Remotion hooks) and `<ThreeWebGPUCanvas>` (three.js `WebGPURenderer` with TSL node materials); three.js needs the `angle` renderer; `<Sequence>` inside needs `layout="none"`; animate with `useCurrentFrame()` instead of `useFrame()`; the old video-texture hooks are deprecated in favour of `@remotion/media` — [Remotion three docs](https://www.remotion.dev/docs/three)
- Video clips: `<Video>` from `@remotion/media` (Mediabunny and WebCodecs) is "the recommended component", frame-perfect and the fastest to render, with partial downloads; it supports H.264, VP8, VP9 and ProRes; `<OffthreadVideo>` adds H.265 and AV1 — [Remotion video tags](https://www.remotion.dev/docs/video-tags)
- The docs index also lists `@remotion/transitions`, captions, `@remotion/shapes`, `@remotion/media`, Mediabunny, client-side rendering and "Prompting videos with coding agents" — [Remotion docs index](https://www.remotion.dev/llms.txt)

#### Remotion GPU and encoding
- The GPU helps WebGL content (three.js, Skia, P5.js, Mapbox), video decoding, shadows, gradients, `filter: blur()`, transforms and much 2D canvas work; Studio and Player use the GPU by default, but headless Chromium disables it, so renders need the `--gl` flag — [Remotion GPU docs](https://www.remotion.dev/docs/gpu)
- For WebGL, WebGPU or three.js on a desktop the recommended backend in 4.0 is `angle` (the 4.0 default is `null`; `angle` becomes the default in 5.0); `angle` has known memory leaks, so long renders should be split into parts — [Remotion gl options](https://www.remotion.dev/docs/gl-options)
- Hardware-accelerated encoding: `--hardware-acceleration if-possible` uses VideoToolbox on macOS (ProRes since v4.0.228, H.264 and H.265 since v4.0.236); files are much larger unless `--video-bitrate` is set (for example 8M for Full HD); `crf` does not work with hardware encoders — [Remotion hardware acceleration](https://www.remotion.dev/docs/hardware-acceleration)

#### Remotion licence
- Free Licence: "For individuals and companies of up to 3 people", all features, commercial use allowed. Company Licence for everyone else: Remotion for Creators at $25 per month per seat ("Get 1 seat per user"; covers local motion design "with AI agents and Remotion Studio"), and Remotion for Automators at $0.01 per render with a $100 monthly minimum (for automated video products). Enterprise from $500 per month — [Remotion licence and pricing](https://www.remotion.dev/docs/license/pricing)
- "Eligibility depends on your company's total headcount"; "AI agents. Only the people using them need a Seat"; a render is "the successful generation of a video, audio, GIF, still image or image sequence" and Studio previews do not count; evaluation is allowed for anyone "evaluating whether the Remotion Software is a good fit, and are not yet using it in a commercial way"; contractors operating Remotion on the same project count toward the headcount — [Remotion licence FAQ](https://www.remotion.dev/docs/license/faq)
- Third-party sites say the Company Licence has a minimum charge of about $100 per month (one describes it as 4 seats at $25) — [Doolpa](https://doolpa.com/article/remotion); [Nubiapage](https://nubiapage.com/motion-review-2026-pricing-templates-free-plan-download-faqs/); not confirmed by the official page read, which states a $100 monthly minimum only for Automators and $25 per seat for Creators — [Remotion licence and pricing](https://www.remotion.dev/docs/license/pricing)

#### HyperFrames, Motion Canvas, Theatre.js
- HyperFrames compositions are HTML files with data attributes for timing, and can use GSAP, CSS, Lottie, three.js, Anime.js and the Web Animations API; no build step; Apache-2.0; its README credits Remotion as inspiration and concedes Remotion Lambda is the more mature cloud renderer — [HyperFrames GitHub](https://github.com/heygen-com/hyperframes)
- Comparison posts relay a community view that HyperFrames is easier to start but more token-hungry, slower and less successful at design than Remotion; no controlled head-to-head test of agent output was found — [Moda comparison](https://moda.app/blog/hyperframes-vs-remotion); [AutoAE comparison](https://autoae.online/blog/hyperframes-vs-remotion-developer-verdict)
- Motion Canvas: 19.8k stars, 895 forks, MIT, 153 open issues, 955 commits — [Motion Canvas GitHub](https://github.com/motion-canvas/motion-canvas)
- A 2026 roundup puts Motion Canvas's last commit about 2.6 months before its check, Revideo's about 2.2 months, and Theatre.js's about 25 months — [Capital and Compute roundup](https://capitalandcompute.net/blog/best-open-source-ai-video-tools/)

#### What reads as premium in 2026
- A vendor study of 95 enterprise AI launch videos from 78 companies (5 Jan to 3 Aug 2026) reports that captured product screens replaced animated mockups, live action fell, and median runtime was about 1:11 from April to August — [ADVIDS study](https://advids.co/blog/enterprise-ai-launch-video-trends)
- Trend roundups name liquid glass (transparency and refraction), layered 3D depth, kinetic typography, soft 3D and sound-synced stings as 2026 styles — [GarageFarm](https://garagefarm.net/blog/animation-trends-to-watch); [AutoAE trends](https://autoae.online/blog/motion-graphics-trends-2026); [Renderforest](https://www.renderforest.com/blog/logo-animation-trends)
- A Codrops tutorial (8 Sep 2026) builds a liquid-glass effect with three.js, WebGPU and TSL, noting that transmission, ior, thickness and dispersion on a rounded box give convincing glass out of the box — [Codrops](https://tympanus.net/codrops/2026/09/08/building-an-infinite-liquid-glass-grid-with-three-js-webgpu-and-tsl/)

### Inferences
- Recommended: stay on the existing Remotion 4.0 project and upgrade to 4.0.543. Use `@remotion/three` (`<ThreeWebGPUCanvas>` with TSL materials for glass and device mockups, a clip mapped onto the screen mesh), `@remotion/effects` for lens blur, magnify, curves, turbulence and wipes, `@remotion/transitions` for cuts, captions tooling for subtitles, and `@remotion/media` `<Video>` for the 30 to 40 clips. Render with `--gl=angle` and `--hardware-acceleration if-possible`, in parts, because of the `angle` memory-leak note.
- Clip codec trap: `<Video>` does not list H.265, and fal's Topaz endpoint outputs H.265 unless `H264_output` is set, so transcode AI clips to H.264 or ProRes (or set the flag) before they enter the timeline.
- Licence for this project: the user is an employee of a large company, so the Free Licence does not apply by headcount; one Creators seat ($25 per month for the one person directing the agent) covers it, and the agent needs no seat. A hackathon film shown inside the company is plausibly past "evaluation", so the seat is the safe reading. A solo developer on a personal project pays nothing.
- Alternative: HyperFrames if any licence fee or approval is a blocker. It costs nothing at any company size and suits GSAP-style kinetic type, but has a shorter track record and weaker evidence on design quality.
- Motion Canvas suits explanatory diagram animation written by hand more than agent-built product films; Theatre.js should not be started on in 2026.
- Remotion 5.0 is referenced in the docs (default renderer change) but the newest release is 4.0.543, so 5.0 appears unreleased as of 11 Nov 2026.
- For the premium look, the evidence favours real product screens with tasteful zooms over invented mockups, plus one or two 3D or glass moments; three.js with WebGPU inside Remotion can deliver those without Blender.

### Gaps
- No Apple Silicon specific guidance (which `--gl` backend engages Metal, expected speed-up on an M4 Pro) is in the Remotion pages read.
- Whether drei helpers and the postprocessing library render deterministically inside `<ThreeCanvas>` is not documented on the pages read; no 2026 Remotion plus drei premium device-mockup example was found.
- Lottie, Rive and light-leak packages were not confirmed by name in the docs index read (Rive is implied by `<RemotionRiveCanvas>` in the effects page).
- "What looks premium" rests on vendor trend posts and one vendor study; no neutral survey was found.
- Whether Creators seats carry a minimum monthly charge is unresolved between the official page and third-party sites.

## 4. Real 3D: is headless Blender (or a Blender MCP) worth adding?

### Takeaway
For a 2-minute product film, three.js inside Remotion plus generated video is enough for almost every shot; Blender is worth adding only for one or two hero renders that need ray-traced glass, metal or depth of field. If it is added, run it headless from scripts; the official MCP server executes model-written code with no sandbox.

### Cited Findings
- The official Blender Lab MCP server (v1.0.3, 11 Sep 2026, Blender 5.1+) has `_for_cli` tool variants that open `.blend` files in background Blender processes; it has no generation features; Blender Lab recommends a virtual machine because code runs "without any guards in place" — [StraySpark comparison](https://www.strayspark.studio/blog/official-blender-mcp-server-comparison-2026)
- The community "MCP for Blender" integrates Poly Haven, Sketchfab, Hyper3D Rodin, Hunyuan3D and Tripo for asset generation, runs any Python by default, and had four CVEs in 2026 — [StraySpark comparison](https://www.strayspark.studio/blog/official-blender-mcp-server-comparison-2026)
- Image or text to 3D models are cheap on fal (Hunyuan3D V3 $0.015 per unit, Trellis 2 $0.05, Tripo H3.1 $0.01 per credit, Rodin V2.5 $0.4, Meshy 6 $0.8) — [fal pricing](https://fal.ai/pricing)
- Remotion's `<ThreeWebGPUCanvas>` supports three.js's WebGPU renderer and TSL node materials — [Remotion three docs](https://www.remotion.dev/docs/three)
- Render-speed data points, all older than the brief's window: a November 2024 review measured 2,523.52 points for the M4 Pro (14-core CPU, 20-core GPU) in the Blender Benchmark GPU test, between M1 Max and M2 Max — [ITmedia review](https://www.itmedia.co.jp/pcuser/articles/2411/07/news191_2.html)
- An M4 Max scored almost 5,200 points in the same benchmark (November 2024) — [Notebookcheck](https://www.notebookcheck.net/Apple-M4-Max-defeats-RTX-4070-Desktop-GPU-in-Blender-benchmark-trades-blows-with-RTX-4080-Laptop.920575.0.html)
- A base M4 Mac mini rendered the Classroom scene in 80.46 s and Junkshop in 68.30 s with Metal on Blender 4.3 — [OpenBenchmarking result](https://openbenchmarking.org/result/2501134-NE-MACMINIM472)
- The digitalsamba toolkit ships a Blender skill marked experimental — [claude-code-video-toolkit GitHub](https://github.com/digitalsamba/claude-code-video-toolkit)

### Inferences
- Rough render budget for Cycles on the M4 Pro: assume its GPU is about 1.5 to 2 times as fast as the base M4 that rendered Classroom in 80 s (an assumption; the only M4 Pro figure found is a benchmark score about half an M4 Max's), so a Classroom-class frame takes about 40 to 55 s. Then a 4-second hero shot at 30 fps (120 frames) takes about 1.3 to 1.8 hours, and a full 2-minute film (3,600 frames) about 40 to 55 hours. So Cycles is practical for one or two short hero shots only, not for the whole film. Real scenes vary widely from benchmark scenes.
- A path that needs no MCP: generate a GLB with a fal 3D model, write a Python scene script, run Blender in background mode from the shell, and bring the frames into Remotion as an image sequence or ProRes clip. The MCP adds live screenshots and scene inspection, which mainly helps when the agent must look at a viewport.
- For device mockups, glass cards and particle fields, three.js with WebGPU in Remotion renders at interactive speed on the GPU and stays inside one render pipeline, so it should be the default; generated video covers organic or photoreal shots.
- If Blender is added, prefer the official Blender Lab server (GPL, maintained by Blender's own lab) in a virtual machine over the community server, whose defaults are unsafe.

### Gaps
- No Blender 5.x benchmark or render time for the M4 Pro dated 2026 was found; the Blender Open Data site did not return data to the page reader.
- Blender's own licence page and headless command-line documentation were not read in this session.
- Eevee (real-time) render times on Apple Silicon were not found.
- No write-up of an agent producing a finished product shot through headless Blender in the September to November 2026 window was found.

## 5. Product screen recordings: making raw captures look premium, and what an agent can automate

### Takeaway
The polished look (auto zoom on clicks, smoothed cursor, motion blur, padded background) can be automated end to end in two ways: a code route (Playwright capture with logged click positions, then zoom keyframes and a drawn cursor in Remotion) or OpenScreen, an MIT recorder with a headless command line and its own MCP server. Screen Studio gives the best-known look but has no command line, API or MCP, so only a click-through session can drive it.

### Cited Findings
- Screen Studio (read 14 Nov 2026): macOS only; $9 per month billed yearly or $29 monthly; one-time licences are no longer sold; auto zoom from clicks, smoothed cursor, optics-based motion blur, click effects, iPhone and iPad device frames, export to 4K at 60 fps; shareable presets; its page mentions no CLI, API, MCP or scripting, only a global record shortcut — [Screen Studio](https://screen.studio)
- Cap: AGPLv3 app with a CLI (`record start` with `--screen`, `--window`, `--duration`, `--detach`; `export` with `--format`, `--fps`, `--resolution`, `--settings-json`; `project config get/set`; `--json` output and exit codes); the editor has auto zoom generated from clicks, cursor smoothing presets, separate cursor and screen motion blur, and backgrounds with padding and shadow; no export flag for auto zoom is listed and device frames are not mentioned; the free tier is personal use only, commercial use needs a Desktop Licence at $29 per year or $58 one-time; Cap Pro is $12 per user per month — [Cap docs](https://cap.so/llms-full.txt)
- OpenScreen (getopenscreen/openscreen): MIT, 7.3k stars, macOS 13+, Windows and Linux; auto zoom that follows the cursor, cursor smoothing, click effects, motion blur, backgrounds, annotations, transcript-based cutting; headless commands `openscreen record --duration <s> --project <file> --json` and `openscreen export <project> -o <file> --json`; `openscreen mcp` starts an MCP server that registers with Claude Code; its README describes an agent planning a storyboard, recording, editing zooms and trims, exporting and checking frames without a person; it warns of breaking changes, and macOS 15+ re-prompts for screen-recording permission periodically — [OpenScreen GitHub](https://github.com/getopenscreen/openscreen)
- Recordly is a free AGPL recorder with auto zoom and cursor polish; no command line was found for it — [AlternativeTo listing](https://alternativeto.net/software/recordly/about)
- Rotato (3D device mockup videos): about $19.92 per month billed yearly ($239 per year) per an October 2026 check; no CLI or API was found — [ToolRadar](https://toolradar.com/tools/rotato/pricing)
- Code route building blocks: DemoForge (MIT) plans zooms from logged click positions and draws a smooth cursor because Playwright never moves a real one — [DemoForge listing](https://peerlist.io/dixitram/project/demoforge)
- Clipwise is a YAML-driven recorder on Playwright with adaptive zoom, cursor trails, click ripples and speed ramps (licence not stated) — [Clipwise](https://kwakseongjae.github.io/clipwise)
- A Playwright recorder write-up reports about a 0.8 s offset between Node's clock and the video's timestamps, which matters when syncing logged events to footage — [XDSoft blog](https://xdsoft.net/blog/ai-powered-demo-video-recorder)
- The digitalsamba toolkit's playwright-recording skill adds cursor and click-ripple overlays and advises converting Playwright's WebM to MP4 with ffmpeg before Remotion — [claude-code-video-toolkit GitHub](https://github.com/digitalsamba/claude-code-video-toolkit)
- Remotion gained a `magnify()` effect in v4.0.542 and a `lensBlur()` effect in v4.0.537 — [Remotion releases](https://github.com/remotion-dev/remotion/releases)
- A vendor study says real captured product screens replaced animated mockups in 2026 enterprise AI launch videos — [ADVIDS study](https://advids.co/blog/enterprise-ai-launch-video-trends)

### Inferences
- Recommended (fully automatable, no new licence): drive the product with Playwright at 2x device scale, log every click and typed field with timestamps, record the page, then in Remotion apply spring-eased zoom keyframes centred on logged clicks, draw a synthetic cursor along a smoothed path, add click ripples, a rounded window on a soft gradient, and light motion blur. This keeps the look in code, so re-recording after a product change is one command, and zoom timing can be matched to the voice-over.
- Alternative (packaged look, still headless): OpenScreen's CLI and MCP, MIT, at the cost of a young project with a changing project format and the macOS screen-recording permission prompt, which a person must grant once.
- Cap is the next choice if its editor look is preferred, but commercial use needs the paid Desktop Licence and auto-zoom settings must go through `--settings-json` or project config, whose schema was not read.
- Screen Studio remains the reference look and has iPhone and iPad frames built in, but an agent can only operate it through a computer-use session clicking its window; treat it as a manual fallback, and note that its subscription terms for company use were not on the page read.
- For 3D device shots, a three.js device model in Remotion with the recording as the screen texture replaces Rotato, which has no automation route.
- Budget time for the clock offset between logged events and video frames (about 0.8 s in one report); calibrate with a visible sync flash on the first frame.

### Gaps
- No source compares the visual quality of the code route against Screen Studio.
- Cap's `--settings-json` schema and whether its CLI needs the desktop app running were not documented on the page read.
- OpenScreen's MCP tool list, latest release number and date were not shown on the page read.
- Screen Studio's team or commercial licence terms were not read.
- The Remotion template for cinematic product demos seen in search snippets ("remotion-cinematic", MIT) could not be traced to a verified repository.

## 6. Edit and finishing: whole edit in code or an editor, plus upscaling, interpolation, deflicker, colour and grain

### Takeaway
An agent can do the whole edit in code today: Remotion for the timeline, transitions, titles and (new this autumn) curves and effects; ffmpeg for conform, LUTs, deflicker, grain and loudness; and fal-hosted upscalers for the AI clips. An editor is still worth it for one job, a final shot-matching colour pass, and DaVinci Resolve Studio 21.1 ($295) is the only one with an official assistant link, at the cost of a paid GUI app with undocumented safeguards.

### Cited Findings

#### Editing in code
- Remotion now has `curves()` with graphical colour controls in Studio (v4.0.539), a WebGPU and WebGL2 effects library (v4.0.540), OpenTimelineIO import in Studio (v4.0.542) and an `open-timeline import` command (v4.0.543), plus audio level meters in Studio — [Remotion releases](https://github.com/remotion-dev/remotion/releases)
- ffmpeg's filter reference documents `deflicker` ("Remove temporal frame luminance variations", window size 2 to 129 frames, default 5), `lut3d` ("Apply a 3D LUT to an input video"), `haldclut`, `curves`, `colorbalance`, `colorcorrect`, `eq`, `minterpolate` ("Convert the video to specified frame rate using motion interpolation", default 60 fps), `framerate`, `noise` ("Add noise on video input frame", with a temporal flag) and `gblur` — [ffmpeg filters](https://ffmpeg.org/ffmpeg-filters.html)

#### Editors
- DaVinci Resolve Studio 21.1 (8 Sep 2026) connects to Claude, Claude Code and ChatGPT Codex; the feature is Studio-only and Blackmagic has not documented permissions or safeguards for destructive operations — [Blackmagic press release](https://www.blackmagicdesign.com/media/partial/release/20260908-03); [Digital Production, 8 Sep 2026](https://digitalproduction.com/2026/09/08/resolve-21-1-adds-mcp-and-finally-gets-presets/)
- Launch coverage reports Studio as a one-time US$295 licence and 21.1 as a free update for existing users (taken from a search summary of the coverage; the article itself was not opened) — [CG Channel, 8 Sep 2026](https://www.cgchannel.com/2026/09/blackmagic-design-releases-resolve-21-1/)
- The community Resolve MCP covers edit, colour (node graph, CDL, LUTs, grade copy), render and Fusion operations, and its README says it does not judge whether a cut is good or replace an editor — [davinci-resolve-mcp GitHub](https://github.com/samuelgursky/davinci-resolve-mcp)
- CapCut has no official API; After Effects and Premiere have only community MCP bridges — [AITuber guide](https://aituber.app/blog/capcut-mcp-claude/); [Aodaruma/adobe-mcp-rs](https://github.com/Aodaruma/adobe-mcp-rs)

#### Upscaling and restoring AI clips (fal)
- fal's upscaler guide (24 Aug 2026): Topaz Starlight Precise 2.6 ("realism pass for AI-generated footage") $1.20 per 10 s up to 1080p and $2.60 per 10 s at 4K; Topaz Astra 2 (creative, adds detail) $3.00 per 10 s to 1080p and $5.00 at 4K; Topaz Proteus (real footage, no added detail) $0.10 per 10 s at 720p, $0.20 at 1080p, $0.60 at 4K; FLUX 3 Video Upscaler $0.14 to $0.79 per second by mode and size; Crystal Video Upscaler $0.10 per megapixel per second; Bria $0.14 per second (documented training-data provenance, up to 8K); FlashVSR $0.0005 per megapixel of video data; SeedVR2 $0.001 per megapixel of video data (up to 2160p); ByteDance Video Upscaler $0.0072/s at 1080p, $0.0144/s at 2K, $0.0288/s at 4K (30 fps, Pro tier 10 times that); RealESRGAN $0.0008 per megapixel — [fal upscaler guide](https://fal.ai/learn/tools/video-to-video-upscalers)
- The fal Topaz generative endpoint offers Starlight Precise 2.6 (default), HQ, Mini, Sharp and Fast 2 (half price: $0.60 per 10 s to 1080p, $1.30 at 4K); 60 fps doubles the price; `target_fps` 16 to 60 gives frame interpolation in the same call; output is H.265 unless `H264_output` is set; upscale factor 1 to 4 — [fal Topaz generative endpoint](https://fal.ai/models/topaz/upscale/video/generative/llms.txt)
- fal lists FILM frame interpolation at $0.0013 per compute second — [fal pricing](https://fal.ai/pricing)
- Adobe announced the acquisition of Topaz Labs on 25 Jun 2026 — [TechCrunch](https://techcrunch.com/2026/06/25/adobe-acquires-image-and-video-enhancement-tool-maker-topaz-labs/)
- One report says the deal closed on 23 Sep 2026 and that Adobe's statements do not address the Topaz API, on-premises builds or reseller arrangements — [Beri.net, 24 Sep 2026](https://www.beri.net/article/adobe-topaz-labs-acquisition-closed-standalone-pledge-api-on-prem-reseller-continuity)
- Topaz still publishes developer API docs with API-key access — [Topaz developer docs](https://developer.topazlabs.com/docs/getting-started)

#### Matching mixed AI clips
- Vendor guides advise grading one hero clip fully, saving that grade as a LUT and batch-applying it; working in the order upscale, colour-correct, LUT (50 to 70% strength), grain (35 mm at 8 to 15% opacity), light blur; adding grain last and never baking it into the grade; and using one shared grain layer as a matching tool across generators — [invideo LUT and grain guide](https://invideo.io/blog/luts-film-grain-ai-video/); [invideo post-production order](https://invideo.io/faq/what-is-the-correct-post-production-order-for-ai/); [HackerNoon colour-match post](https://hackernoon.com/how-to-color-match-ai-video-clips-when-every-model-grades-differently)

### Inferences
- Recommended finishing chain, all scriptable: (1) conform every clip to one frame rate, colour space and codec with ffmpeg (H.264 or ProRes so Remotion's `<Video>` accepts it); (2) run AI clips through Topaz Starlight Precise 2.6 on fal for a realism and upscale pass, with `target_fps` if a clip needs interpolation, or ByteDance's or SeedVR2's upscaler as cheaper options; (3) `deflicker` only on clips that shimmer; (4) per-clip correction with `curves` or `colorbalance` toward a hero clip, then one shared LUT through `lut3d`; (5) assemble in Remotion; (6) one grain layer over the whole film last (ffmpeg `noise` with the temporal flag, or a grain plate composited in Remotion).
- Derived 4K upscale prices per second of output at 30 fps: Topaz Precise 2.6 $0.26; Topaz Fast 2 $0.13; Topaz Proteus $0.06; ByteDance standard $0.0288; SeedVR2 about $0.25 and FlashVSR about $0.12 if "megapixel of video data" means output pixels times frames (3840 × 2160 × 30 frames is about 249 megapixels per second). For a 120-second master that is about $31 on Topaz Precise, $16 on Fast 2 and $3.50 on ByteDance standard.
- Deliver at 1080p unless 4K is required: the top generators output 720p to 1080p natively (MiniMax H3's 2K and 4K are upscales of a 768p base), motion graphics render at any size, and a 4K master doubles finishing cost and time.
- When an editor still earns its place: shot-to-shot colour matching by eye across 30 to 40 clips from different models. Resolve Studio's built-in assistant link makes it agent-reachable, but it needs the $295 Studio licence, an installed GUI app that someone opens, and care because safeguards are undocumented. For this film the code route with a hero-clip LUT is the lower-risk default, with Resolve as an optional last pass.
- The agent should check its own work, because nothing in code "watches" the cut: extract frames at each cut, compare luma and colour statistics between neighbouring shots, and review a contact sheet before and after the grade.
- Supply risk: Topaz is now owned by Adobe and public statements are silent on the API, so keep a second upscaler (SeedVR2, ByteDance, FLUX 3 Video Upscaler) wired in.

### Gaps
- No ffmpeg-specific tutorial for matching AI clips was found; the workflow advice comes from one vendor's blog posts written for editor apps.
- Topaz "Astra" on fal is listed as Astra 2 (creative); whether Astra's web product changes after the move to "Topaz for Web" affects API access is unresolved.
- Maximum input length and resolution for the fal Topaz endpoints are not stated on the page read.
- How "megapixel of video data" is counted for SeedVR2 and FlashVSR billing was not confirmed.
- The exact scope of scripting left in the free edition of Resolve 21.1 is disputed between two sources.
- No source in the window shows a film finished wholly in code and judged at a professional level by a third party.

## 7. Audio: music with a usable licence, sound effects and foley, mixing and mastering in code

### Takeaway
ElevenLabs Music (v2.5, $0.15 per minute by API) is the best documented and best licensed option, but its public terms limit self-serve plans to individuals or small entities (Business tier tops out below 50 employees), so a large company needs an Enterprise music plan; Google's Lyria 3.5 ($0.08 per song through the Gemini API key already on the Mac) is the cheapest scriptable alternative, and Suno v6 and Udio have no official API. Sound effects and foley are covered by ElevenLabs sound effects, video-to-audio models on fal and the video models' native audio; mixing and loudness are fully scriptable in ffmpeg.

### Cited Findings

#### Music
- ElevenLabs: current model is Music v2.5 (`music_v2_5`); `music_v1` is removed on 31 Jan 2027; 3 seconds to 5 minutes; vocals or instrumental; composition plans, audio reference (about 30 s), section inpainting; MP3 and WAV; the API is open to paid subscribers; the page says the model was created with labels, publishers and artists and is "cleared for nearly all commercial uses" — [ElevenLabs music capability docs](https://elevenlabs.io/docs/overview/capabilities/music)
- ElevenLabs music terms (last updated 9 Oct 2026): Free, Starter, Creator and Pro are "individual use only"; Scale is for individuals or entities with fewer than 10 employees; Business for fewer than 50 employees; Enterprise Music Lite and Enterprise Music have no eligibility restriction; film, TV, radio and studio games are excluded on every plan except Enterprise Music; Free requires attribution and has no API; monthly generation limits run from 11 (Free) to 4,800 (Business) — [ElevenLabs music terms](https://elevenlabs.io/music-terms)
- ElevenLabs API prices: music $0.15 per minute; sound effects $0.12 per minute; text to speech $0.08 per 1,000 characters for v3 and v4; voice isolator $0.12 per minute; plans Starter $6, Creator $22, Pro $99, Scale $299, Business $990 per month — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
- Google Lyria on the Gemini API: `lyria-3.5` $0.08 per full song (paid tier only), `lyria-3-pro-preview` $0.08 per song, `lyria-3-clip-preview` $0.04 per 30-second clip — [Gemini API pricing](https://aistudio.google.com/docs/pricing)
- Google Cloud's Lyria 3 page says customers may use the preview offering for production or commercial purposes under Google Cloud's service terms; no equivalent statement was found for the Gemini API; outputs carry a SynthID watermark — [Google Cloud Lyria 3 docs](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/lyria/lyria-3); [invideo Lyria explainer](https://invideo.io/blog/lyria-ai-music-generator/)
- Suno launched v6, v6-wild and v6-mini on 9 Sep 2026 with Warner Music Group, BMG and Believe as licensed partners — [Music Business Worldwide](https://musicbusinessworldwide.com/suno-v6-ai-music-models-launch-in-partnership-with-wmg-bmg-and-believe)
- Suno has no official public API; in early July 2026 it said it was exploring a developer API with a curated partner group and gave no timeline — [Digital Music News, 3 Jul 2026](https://www.digitalmusicnews.com/2026/07/03/suno-is-opening-an-api-partner-program/); [Music Business Worldwide](https://musicbusinessworldwide.com/suno-explores-developer-api-seeking-apps-that-unlock-experiences-generative-music-makes-possible-for-the-first-time)
- Suno plans per third-party guides: Pro about $10 and Premier about $30 per month with commercial rights, Free non-commercial; terms effective 3 Sep 2026 cap downloads at 20 songs per month on Pro and 60 on Premier; no team or company plan was found — [DIY AI pricing guide](https://diyai.io/ai-tools/audio-generation/suno-pricing/); [Jack Righteous on the 3 Sep 2026 terms](https://jackrighteous.com/ja/blogs/guides-using-suno-ai-music-creation/suno-premier-60-song-download-limit-september-3-2026)
- Hubs that list a "Suno API" (for example Kie, at V5.5) are not Suno; they are third-party wrappers — [Kie market](https://kie.ai/market)
- Udio switched off downloads after its settlement with Universal in late 2025 and planned a licensed subscription platform for 2026; in April 2026 that platform was still described as forthcoming; no API was found — [WebProNews](https://www.webpronews.com/udio-halts-ai-song-downloads-after-copyright-settlement-with-umg-warner); [Music Business Worldwide](https://www.musicbusinessworldwide.com/after-universal-warner-and-merlin-deals-now-udio-inks-licensing-agreement-with-kobalt)
- Stable Audio 2.5 is available through Stability's API, partner platforms and on-premises with an enterprise licence — [Stability announcement](https://stability.ai/news/stability-ai-introduces-stable-audio-25-the-first-audio-model-built-for-enterprise-sound-production-at-scale)
- Third-party pages say organisations above $1 million in annual revenue need a direct enterprise contract with Stability, and one lists API access at $0.20 per output file — [AI Wiki](https://aiwiki.ai/wiki/stable_audio_2_5); [CostBench](https://costbench.com/software/ai-music-generators/stable-audio/)

#### Sound effects and foley
- ElevenLabs ships an official sound-effects skill and API ($0.12 per minute in its price table, while its FAQ says billed per generation) — [ElevenLabs agent tooling](https://elevenlabs.io/docs/eleven-api/resources/agent-tooling); [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
- Mirelo SFX 2.0 on fal generates a synchronised soundtrack from an input video, with text guidance, negative prompts, multiple samples and preservation of existing speech; introductory pricing runs 14 Oct to 13 Dec 2026, and the standard $0.015 per second resumes on 14 Dec 2026 — [fal Mirelo SFX 2.0](https://fal.ai/models/mirelo-ai/sfx2.0/video-to-audio/llms.txt)
- MMAudio V2 on fal generates synchronised audio from video and optional text — [fal MMAudio V2](https://fal.ai/models/fal-ai/mmaudio-v2/llms.txt)
- Native audio is included at no extra cost in Seedance 2.5 (sound effects, ambience, lip-synced speech), Wan 3.0 and Gemini Omni Flash 1.2 on fal — [fal Seedance 2.5 model page](https://fal.ai/models/bytedance/seedance-2.5/us/text-to-video/llms.txt); [fal Wan 3.0 model page](https://fal.ai/models/alibaba/wan-3.0/text-to-video/llms.txt); [fal Gemini Omni Flash 1.2 model page](https://fal.ai/models/google/gemini-omni-flash/v1.2/text-to-video/llms.txt)

#### Mixing and mastering
- ffmpeg `loudnorm`: "EBU R128 loudness normalization. Includes both dynamic and linear normalization modes"; integrated target `I` (default -24.0, range -70 to -5), loudness range `LRA` (default 7.0), true peak `TP` (default -2.0); supports single-pass and double-pass, where measured values from pass one enable linear mode — [ffmpeg filters](https://ffmpeg.org/ffmpeg-filters.html)
- ffmpeg `sidechaincompress` compresses the first input based on the level of a second input (threshold default 0.125, ratio 2, attack 20 ms, release 250 ms); `acompressor`, `afade`, `speechnorm` and `dynaudnorm` are also documented — [ffmpeg filters](https://ffmpeg.org/ffmpeg-filters.html)
- AI mastering: LANDR offers a developer Mastering API (documentation, OAuth, webhooks, sandbox; three loudness settings and several styles) aimed at partners — [ProSoundWeb](https://www.prosoundweb.com/?p=162875)
- CloudBounce offers a REST API for batch mastering — [MixingGPT roundup](https://mixinggpt.com/blog/best-ai-mastering-services-2026)
- Matchering is a free, open-source Python package that matches spectral balance and loudness to a reference track and runs locally — [Futureproof Music School](https://futureproofmusicschool.com/blog/best-ai-tools-for-mixing-and-mastering)

### Inferences
- Licence reading for an internal film at a large company: ElevenLabs' self-serve music tiers do not fit on paper (individual use, or entities under 10 or 50 employees), so either the company's Enterprise agreement must include music, or another source is needed. An internal demo film is not film, TV or radio, so the media-rights exclusion is not the issue; plan eligibility is. This is the single most important licence check in the audio stage.
- Practical order of preference for music: (1) ElevenLabs Music v2.5 if the employer has, or will sign, an Enterprise plan covering music (best controls: composition plans and section inpainting to hit picture cuts); (2) Lyria 3.5 through the Gemini API key already on the Mac at $0.08 per song, after confirming the Gemini API terms allow business use, or through Google Cloud where commercial use is stated; (3) Stable Audio 2.5 under an enterprise licence through the Stability key already on the Mac (terms and price not verified); (4) Suno v6 only by hand in its web app on a paid plan, with no API, download caps and no company plan found. Avoid third-party "Suno API" wrappers for company work. Udio is not usable.
- Stems: no source confirmed stem export through the ElevenLabs Music API or Lyria; plan to generate an instrumental bed and keep voice, music and effects as separate files, which is what ducking needs anyway.
- Sound design recipe an agent can script: take native audio from the video model for ambience where it exists; run silent or motion-graphics shots through Mirelo SFX 2.0 or MMAudio V2 on fal for synced foley; add spot effects (whooshes, clicks, risers) from ElevenLabs sound effects; generate voice-over with the ElevenLabs key already on the Mac.
- Mix recipe in ffmpeg: voice-over as the sidechain key that ducks music with `sidechaincompress`, `afade` on music in and out, then two-pass `loudnorm` on the final mix. Common web delivery practice is about -14 LUFS integrated with a true peak of -1 to -2 dBTP; that target comes from general practice and was not verified against a source in this session.
- AI mastering adds little for a dialogue-led film mix; Matchering against a reference track is a free local option if the music bed needs to sound like a chosen reference. LANDR's API is partner-oriented and probably not worth onboarding for one film.

### Gaps
- Stem export for ElevenLabs Music and Lyria was not confirmed; third-party posts mention stems on ElevenLabs plans without a primary source.
- The Gemini API terms for commercial use of Lyria output, and any indemnity, were not found.
- Suno's own terms and any enterprise or team offer were not read (third-party guides only); Udio's current status in November 2026 is unconfirmed.
- Stability's current audio model, API price and licence page were not read; one aggregator mentions a "Stable Audio 3.0" that could not be confirmed.
- No blind quality comparison of ElevenLabs Music v2.5, Lyria 3.5, Suno v6 and Stable Audio 2.5 was found.
- Loudness targets for an internal company film were not sourced (search budget exhausted).
- ElevenLabs' indemnity terms sit in its main agreement, which was not read.

## 8. Cost model: API spend for a 2-minute film on the top three video models, and subscriptions that lower it

### Takeaway
At list prices on fal, video generation for the whole film costs roughly $50 to $115 on MiniMax H3 (768p), $160 to $380 on Wan 3.0 (1080p) and $940 to $2,210 on Seedance 2.5 (1080p), or $380 to $900 on Seedance 2.5 at 720p; everything else (stills, upscale, music, effects, voice) adds only about $40 to $60. The cheapest levers are drafting takes at low resolution, calling Gemini Omni Flash through Google's own API, and, if a click-through session is acceptable, a Google AI plan whose Flow credits work out near $0.03 per second.

### Cited Findings
- Per-second list prices used below: Seedance 2.5 $0.2205 (480p), $0.4730 (720p), $1.164 (1080p) — [fal Seedance 2.5 model page](https://fal.ai/models/bytedance/seedance-2.5/us/text-to-video/llms.txt)
- Wan 3.0 $0.10 (720p), $0.20 (1080p) — [fal Wan 3.0 model page](https://fal.ai/models/alibaba/wan-3.0/text-to-video/llms.txt)
- MiniMax H3 $0.06 (768p), $0.13 (2K), $0.16 (4K) — [fal MiniMax H3 model page](https://fal.ai/models/minimax/h3/text-to-video/llms.txt)
- Gemini Omni Flash 1.2 about $0.07 (720p) and $0.104 (1080p) direct from Google — [Gemini API pricing](https://aistudio.google.com/docs/pricing)
- Kling 4.0 $0.157 (720p), $0.235 (1080p) — [fal Kling 4.0 model page](https://fal.ai/models/kling/v4/text-to-video/llms.txt)
- Veo 3.1 $0.40 per second with audio — [fal text-to-video catalogue](https://fal.ai/explore/text-to-video-apis)
- Supporting prices: Nano Banana Pro $0.15 per image on fal — [fal pricing](https://fal.ai/pricing)
- Topaz Starlight Precise 2.6 $2.60 per 10 s at 4K, Fast 2 $1.30 — [fal Topaz generative endpoint](https://fal.ai/models/topaz/upscale/video/generative/llms.txt)
- ElevenLabs music $0.15 per minute, sound effects $0.12 per minute, speech $0.08 per 1,000 characters — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
- Mirelo SFX 2.0 standard $0.015 per second — [fal Mirelo SFX 2.0](https://fal.ai/models/mirelo-ai/sfx2.0/video-to-audio/llms.txt)
- Take-rate evidence (vendor sources): budget about 3 generations per usable shot and expect about 25% of clips to reach the final cut; one documented 3-minute episode used 164 clips, kept 41 and cost about $950; true cost per usable clip is 3 to 4 times the per-generation price — [invideo on generations per shot](https://invideo.io/faq/how-many-ai-video-generations-does-it-take-to-produce-a/); [invideo on cost per usable clip](https://invideo.io/faq/what-is-the-true-cost-per-usable-ai-video-clip-when-you/)
- A test on Seedance 2.5's draft mode reports a break-even for the draft-to-final pipeline at 1.22 rejected takes — [HackerNoon](https://hackernoon.com/ai-video-draft-mode-doesnt-make-renders-cheaper-it-makes-mistakes-cheaper)
- Google AI plans: Google's own post (19 May 2026) introduces a $100 per month AI Ultra plan and cuts the top Ultra plan from $250 to $200; Pro and Ultra subscribers can buy top-up credits for Flow — [Google blog](https://blog.google/products-and-platforms/products/google-one/google-ai-subscriptions/)
- Third-party guides give the Flow credit numbers: Plus $4.99 with 200 credits, Pro $19.99 with 1,000, Ultra $99.99 with 10,000 and $199.99 with 25,000 per month; an 8-second Gemini Omni Flash clip costs 25 credits and Veo 3.1 Quality 100 credits — [SaaS CRM Review Flow pricing](https://saascrmreview.com/google-flow-pricing/); [WaveSpeed Omni Flash pricing post](https://www.wavespeed.ai/blog/posts/omni-flash-pricing/)
- Higgsfield plans per competitor and vendor blogs (pricing page captured 6 Sep 2026): Plus at $59 monthly or $47 billed annually with 1,200 credits unlocks Seedance 2.5 up to 1080p; the entry tier ($15 or $19, sources differ) covers only Seedance 2.0 Fast and Mini; sources conflict on whether Kling 3.0 is unlimited or drawn from credits — [Krea blog on Higgsfield pricing](https://www.krea.ai/blog/higgsfield-pricing-explained-2026-unlimited-credits-and-real-monthly-costs); [Higgsfield blog](https://higgsfield.ai/blog/best-all-in-one-subscription-ai-images-video)
- Replicate shows MiniMax H3 Lite and Highspeed at 50% off until the end of the year — [Replicate pricing](https://replicate.com/pricing)

### Inferences
- Assumptions for the model: every take is a 5-second generation (shots average 3 to 4 seconds on screen; minimum lengths are 4 s for Seedance 2.5, 5 s for MiniMax H3, 3 s for Kling 4.0 and Omni, 2 s for Wan 3.0). Low case: 35 shots, 8 hero shots at 10 takes and 27 standard shots at 3 takes, which is 161 takes or 805 seconds. High case: 40 shots, 12 hero shots at 20 takes and 28 standard shots at 5 takes, which is 380 takes or 1,900 seconds. In a product film many shots are motion graphics or screen recordings that cost nothing to generate, so real spend should sit below these figures.

| Model and setting | Price per second | Low case (805 s) | High case (1,900 s) |
|---|---|---|---|
| Seedance 2.5, 1080p (fal) | $1.164 | $937 | $2,212 |
| Seedance 2.5, 720p (fal) | $0.473 | $381 | $899 |
| Seedance 2.5, 480p drafts only (fal) | $0.2205 | $178 | $419 |
| Wan 3.0, 1080p (fal) | $0.20 | $161 | $380 |
| Wan 3.0, 720p (fal) | $0.10 | $81 | $190 |
| MiniMax H3, 768p (fal) | $0.06 | $48 | $114 |
| MiniMax H3, 2K upscaled (fal) | $0.13 | $105 | $247 |
| Gemini Omni Flash 1.2, 1080p (Google direct) | $0.104 | $84 | $198 |
| Gemini Omni Flash 1.2, 720p (Google direct) | $0.07 | $56 | $133 |
| Kling 4.0, 1080p (fal) | $0.235 | $189 | $447 |
| Veo 3.1 with audio (fal) | $0.40 | $322 | $760 |

- The "top three" by quality rank among API-available models are Wan 3.0 (#1 text-to-video), MiniMax H3 (#3 text-to-video, #4 image-to-video) and Seedance 2.5 (#1 image-to-video, #4 text-to-video); Seedance 2.5 costs about 6 times Wan 3.0 and about 19 times MiniMax H3 per second at comparable settings ($1.164 vs $0.20 vs $0.06).
- Draft-first on Seedance 2.5: if every take is drafted at 480p and only the chosen 35 to 40 shots (175 to 200 s) are completed at 1080p, the bill is about $381 (low) to $652 (high), assuming completion is billed at the 1080p rate, which the page does not state. That is 59% to 71% below the all-1080p figures.
- A mixed plan is the realistic one: explore and block every shot on MiniMax H3 or Wan 3.0 at 720p (about $50 to $190 for all takes), then spend Seedance 2.5 or Kling 4.0 only on the 8 to 12 hero shots (for example 12 hero shots × 20 takes × 5 s at 720p is $568; at 480p draft plus 1080p finals about $335).
- Other line items for the whole film are small: about 120 start-frame stills at $0.15 is $18; a 4K realism and upscale pass on the 120-second master is $16 to $31 (less if only AI clips are processed); ten 2-minute music takes at $0.15 per minute is $3 (or $0.80 on Lyria 3.5); three video-to-audio passes at $0.015 per second is about $5; ten voice-over takes of about 1,800 characters is about $1.50. Total non-video spend is roughly $40 to $60.
- Subscriptions and levers that lower the bill: (1) Google's own API for Gemini Omni Flash is about 15% under fal's price; (2) a Google AI Ultra plan at about $100 per month would cover roughly 400 eight-second Omni Flash clips (3,200 s, about $0.03 per second) if the third-party credit figures hold, which is the cheapest route found, but Flow is a web UI with no API, so an agent must click through it and Google's terms for automated use were not checked; the high case needs about 238 such clips (5,950 credits); (3) Higgsfield Plus ($59 per month) gives Seedance 2.5 through an official MCP an agent can drive, but its credit cost per clip was not found, so the saving cannot be computed; (4) Replicate's 50% promotion on MiniMax H3 Lite and Highspeed through December; (5) Mirelo's introductory pricing through 13 Dec 2026; (6) buying fal credits early raises concurrency from 2 toward 40, which saves hours rather than dollars.
- No monthly subscription clearly beats pay-per-use for Wan 3.0 or MiniMax H3: their whole-film cost is already near or below one month of a mid-tier creative subscription.
- Time, at about 224 s per Seedance 2.5 take: 161 takes is about 10 machine-hours and 380 takes about 24, so wall-clock time is about 5 to 12 hours at fal's starting concurrency of 2 and about 1 to 2.5 hours at concurrency 10.
- Add Remotion's Creators seat ($25 per month) and, optionally, Resolve Studio ($295 one-time) and Screen Studio ($29 for one month) to the tool budget if those routes are chosen.

### Gaps
- The price to complete a Seedance 2.5 draft at 1080p is not stated on the page read; the draft-first figures assume the 1080p rate.
- Flow credit allowances and per-clip credit costs come from third-party guides, not from a Google page; Flow's terms on automation were not read.
- Higgsfield, Runway, Krea and Magnific credit costs per clip for the top models were not found, so their subscriptions could not be compared in dollars per second.
- Take counts per usable shot come from vendor marketing; no neutral 2026 data on takes per hero shot for Seedance 2.5, Wan 3.0 or MiniMax H3 was found.
- Image-to-video and reference-to-video endpoints can be priced differently from text-to-video (WaveSpeed lists reference-to-video at about 3 times text-to-video for Wan 3.0 and MiniMax H3); fal's image-to-video prices for these models were not read one by one.
- Kling 4.0's audio pricing and Veo 3.1's price on Google's own API were not captured.
