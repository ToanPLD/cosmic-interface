import os
import sys
import yt_dlp
import av

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

OUT_DIR = r"d:\Sources\Code\gift\public\audio"
os.makedirs(OUT_DIR, exist_ok=True)

SONGS = [
    {
        "filename": "flower.mp3",
        "url": "https://www.youtube.com/watch?v=sgNkCrAhTGc",
        "title": "Flower - Johnny Stimson"
    },
    {
        "filename": "wonderful-u.mp3",
        "url": "https://www.youtube.com/watch?v=t3PHmtG0U2U",
        "title": "Wonderful U - AGA"
    },
    {
        "filename": "berlin.mp3",
        "url": "https://www.youtube.com/watch?v=6KCff8T5tR0",
        "title": "BERLIN - Khoi Vu"
    },
    {
        "filename": "cho-trong-trang.mp3",
        "url": "https://www.youtube.com/watch?v=9zM8Nuzbk9c",
        "title": "Chờ trong trăng (Remix) - Wren Evans x Htingale"
    },
    {
        "filename": "nhe-buong.mp3",
        "url": "https://www.youtube.com/watch?v=i4TIcZgasbo",
        "title": "Nhẹ Buông (Remix) - Hằng Ssi x AM"
    },
    {
        "filename": "bien-dao-va-em.mp3",
        "url": "https://www.youtube.com/watch?v=nw86D_nvjvs",
        "title": "[Mashup] Biển Đảo Và Em - QuinVy"
    },
    {
        "filename": "em-la.mp3",
        "url": "https://www.youtube.com/watch?v=QlXheC9zS3w",
        "title": "Em Là (Kirimi Remix) - MONO"
    },
    {
        "filename": "tinh-yeu-mau-nang.mp3",
        "url": "https://www.youtube.com/watch?v=4hRMc7dsIWU",
        "title": "Tình Yêu Màu Nắng - MCK x Obito Beat"
    }
]

def transcode_to_mp3(src_file: str, dst_mp3: str):
    inp = av.open(src_file)
    in_audio = inp.streams.audio[0]

    out = av.open(dst_mp3, 'w')
    out_audio = out.add_stream('mp3', rate=44100)
    out_audio.bit_rate = 192000

    resampler = av.AudioResampler(format='fltp', layout='stereo', rate=44100)

    for packet in inp.demux(in_audio):
        for frame in packet.decode():
            resampled = resampler.resample(frame)
            for r_frame in resampled:
                for out_packet in out_audio.encode(r_frame):
                    out.mux(out_packet)

    for out_packet in out_audio.encode():
        out.mux(out_packet)

    inp.close()
    out.close()

def main():
    print(f"Starting download and conversion of {len(SONGS)} songs into {OUT_DIR}...")

    for i, s in enumerate(SONGS, 1):
        final_mp3 = os.path.join(OUT_DIR, s['filename'])
        if os.path.exists(final_mp3) and os.path.getsize(final_mp3) > 100000:
            print(f"[{i}/{len(SONGS)}] Skipping {s['filename']} (already exists, {os.path.getsize(final_mp3)} bytes)")
            continue

        print(f"\n[{i}/{len(SONGS)}] Processing: {s['title']} ({s['filename']})...")
        temp_pattern = os.path.join(OUT_DIR, f"temp_{i}.%(ext)s")

        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': temp_pattern,
            'quiet': True,
            'no_warnings': True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(s['url'], download=True)
                downloaded_file = ydl.prepare_filename(info)

            print(f"  Downloaded temp: {downloaded_file}")
            print(f"  Transcoding to MP3: {final_mp3}...")
            transcode_to_mp3(downloaded_file, final_mp3)

            if os.path.exists(downloaded_file) and downloaded_file != final_mp3:
                os.remove(downloaded_file)

            size_mb = os.path.getsize(final_mp3) / (1024 * 1024)
            print(f"  ✓ Finished {s['filename']} ({size_mb:.2f} MB)")
        except Exception as e:
            print(f"  ✗ Error processing {s['title']}: {e}")

    print("\nAll downloads and conversions complete!")

if __name__ == '__main__':
    main()
