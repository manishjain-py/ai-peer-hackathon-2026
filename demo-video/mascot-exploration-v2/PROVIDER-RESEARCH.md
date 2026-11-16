# Provider premise check · 16 November 2026

Only read-only source inspection occurred in the other application. Relevant files inspected:

- `llm-content-factory/backend/book_ingestion_v2/services/image_generation_service.py`: `GeminiImageClient`, standard `gemini-3.1-flash-image`, pro `gemini-3-pro-image`, `x-goog-api-key` header, one synchronous `generateContent` request, image returned as inline base64, optional style references.
- `llm-content-factory/workflows/visuals/boards/sticker_gen.py`: separately prompted images, strict cap/ledger, key scrubbing, and rembg cutout stage.
- `llm-backend/config.py`: credential setting name and local configuration location. Only the needed Gemini key was parsed into memory; configuration contents were not printed or copied.

The chosen current model is `gemini-nano-banana-2.1`. Its account metadata probe succeeded and listed `generateContent`. Its first 2048×2048 original character request succeeded. The inspected application's older model path is the method reference, not a claim that it already uses this newer model.

Official Google prices used for this model: input $1.50/million tokens; text/thinking $7.50/million; image $30/million (1680 image tokens at2K = $0.0504). The ledger includes text/thinking/input usage, not only the image headline. [Google pricing](https://ai.google.dev/gemini-api/docs/pricing).

Fal live pricing API returned BiRefNet $0.000575/compute-second; conservative per-image reservation $0.02. H3 Max Turbo account base quote was $0.01875/second, but public rates vary by resolution and changed on16November; requests conservatively use $0.04/second at768P. Fal reported lower billed-unit amounts for animation calls, but the existing ledger policy preserves the higher expected amount. [Fal H3 page](https://fal.ai/models/minimax/h3-max-turbo/image-to-video).

Every uploaded image is newly generated generic character artwork. No private footage, original product screens or real company data was sent to a provider.
