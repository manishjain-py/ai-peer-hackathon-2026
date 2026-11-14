# Where the Earth textures come from

Four pictures, all made from NASA Earth Observatory imagery. Fetched on 2026-11-14 (12:17 UTC)
with `curl` from NASA's own host `assets.science.nasa.gov`, then only cropped or made smaller.
Nothing was repainted, recoloured or mixed with other imagery. They are used by
`src/scenes/earth.js` (the closing shot of the film).

The older host `eoimages.gsfc.nasa.gov` did not answer on that day (every request timed out);
NASA's Earth Observatory pages now link to `assets.science.nasa.gov`, which is where these came from.

## The files

| File | What it is | Exact source URL | What was done to it |
|---|---|---|---|
| `lights_global_4096.jpg` (4096 x 2048) | Night lights of the whole Earth, 2016, lights only on black | `https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144897/BlackMarble_2016_3km_gray.jpg` (13500 x 6750, 3,064,569 bytes) | Made smaller to 4096 x 2048: `ffmpeg -i IN -vf "scale=4096:2048:flags=area" -pix_fmt gray -q:v 2 OUT` |
| `lights_india_3km.jpg` (2048 x 2048) | The same map at its full 3 km detail, South Asia only: 49.707 E to 104.320 E, 47.307 N to 7.307 S | The same file as above | Cut out, not resized: `ffmpeg -i IN -vf "crop=2048:2048:8614:1601" -pix_fmt gray -q:v 2 OUT` |
| `lights_city_500m.jpg` (2048 x 2048) | Night lights at 500 m detail round Bengaluru: 73.325 E to 81.858 E, 17.2375 N to 8.704 N | `https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144897/BlackMarble_2016_C1_gray.jpg` (tile C1, 21600 x 21600, 19,084,287 bytes) | Cut out, not resized: `sips -c 2048 2048 --cropOffset 17463 17598 IN --out crop.png`, then `ffmpeg -i crop.png -pix_fmt gray -q:v 2 OUT` |
| `day_global_4096.jpg` (4096 x 2048) | Land and ocean by day, August 2004 (Blue Marble: Next Generation with topography and bathymetry). Used very dark, as the moonlit ground, and for the thin sunlit edge | `https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography-bathymetry/august/world.topo.bathy.200408.3x5400x2700.jpg` (5400 x 2700, 2,308,163 bytes) | Made smaller to 4096 x 2048: `ffmpeg -i IN -vf "scale=4096:2048:flags=lanczos" -q:v 3 OUT` |

NASA's pages that list these files:

- Night lights ("Earth at Night/Black Marble: Flat Maps", the "2016 Grayscale" set):
  `https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/`
  The page says of them: "These images show Earth's night lights as observed in 2016. The data
  were reprocessed with new compositing techniques that select the best cloud-free nights in
  each month over each land mass."
- Blue Marble: `https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/`

The crops are plain latitude/longitude pictures, so a pixel maps straight to a place: the two
global files cover 180 W to 180 E and 90 N to 90 S; the corners of the two crops are the numbers
above (they are also written in `earth.js` as `WIDE_BOX` and `CITY_BOX`).

## NASA's own words on using them

From NASA's "Images and Media" guidelines, `https://www.nasa.gov/nasa-brand-center/images-and-media/`
(read on 2026-11-14), quoted word for word:

> NASA content – images, audio, video, and media files used in the rendition of 3-dimensional
> models, such as texture maps and polygon data in any format – generally are not subject to
> copyright in the United States. You may use this material for educational or informational
> purposes, including photo collections, textbooks, public exhibits, computer graphical
> simulations and Internet Web pages. This general permission extends to personal Web pages.

> News outlets, schools, and text-book authors may use NASA content without needing explicit
> permission, subject to compliance with these guidelines. NASA content used in a factual manner
> that does not imply endorsement may be used without needing explicit permission. NASA should
> be acknowledged as the source of the material.

Under "COMMERCIAL USE" the same page says:

> If the NASA material is to be used for commercial purposes, including advertisements, it must
> not explicitly or implicitly convey NASA's endorsement of commercial goods or services.

From the Blue Marble page, `https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/`
(read on 2026-11-14):

> Blue Marble: Next Generation was produced by Reto Stöckli, NASA Earth Observatory (NASA
> Goddard Space Flight Center).

> Anyone using or republishing Blue Marble: Next Generation please credit "NASA Earth Observatory."

## What that means for the film

- Credit to give somewhere with the film: **"Earth imagery: NASA Earth Observatory (Black Marble
  2016; Blue Marble: Next Generation)."**
- The film must not look as if NASA backs the product. It shows no NASA name or mark.
- One honest note on the word "public domain": the brief asked for public-domain NASA imagery.
  NASA's page does not use that phrase for its pictures; it says they "generally are not subject
  to copyright in the United States" and are "made available for use consistent with Media Usage
  Guidelines" (the two rules above: name NASA as the source, imply no endorsement). The files
  here are used on those terms.
- The night-lights page itself carries no separate credit line; the Blue Marble page carries the
  one quoted above.
