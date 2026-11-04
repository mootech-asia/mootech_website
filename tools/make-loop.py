"""把一段影片做成無縫循環的網頁首屏影片，並輸出對應的第一格靜態圖。

做法：把影片最後 FADE 秒和開頭 FADE 秒交叉淡化，結尾會自然融回開頭（不用倒播，攻擊方向不會反過來）。
輸出長度 = 原長度 - FADE；最後一格與第一格相同，循環播放時不會跳格。

用法：python3 tools/make-loop.py 原始影片.mp4 [--fade 1.0] [--width 1920]
輸出：assets/video/e-hero.mp4、e-hero.webm、e-hero-poster.jpg、e-hero-poster-{960,1440,1920}.webp
"""
import argparse, json, os, subprocess, sys

OUT = "assets/video"


def run(cmd):
    print("$", " ".join(cmd[:6]), "...")
    r = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    if r.returncode:
        sys.exit("ffmpeg 失敗：\n" + "\n".join(r.stderr.strip().splitlines()[-6:]))


def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height,r_frame_rate:format=duration", "-of", "json", path],
                       check=True, capture_output=True, text=True)
    d = json.loads(r.stdout)
    num, den = d["streams"][0]["r_frame_rate"].split("/")
    return float(d["format"]["duration"]), float(num) / float(den)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--fade", type=float, default=1.0, help="交叉淡化秒數")
    ap.add_argument("--width", type=int, default=1920)
    a = ap.parse_args()
    dur, fps = probe(a.src)
    fps = round(fps) or 24
    if dur < a.fade * 3:
        sys.exit(f"影片太短（{dur:.1f} 秒），至少要 {a.fade * 3:.1f} 秒")
    os.makedirs(OUT, exist_ok=True)
    loop = os.path.join(OUT, "_loop.mov")
    # main = [fade, end]；head = [0, fade]；main 的最後 fade 秒與 head 交叉淡化
    f = a.fade
    graph = (f"[0:v]fps={fps},scale={a.width}:-2:flags=lanczos,setsar=1,split[a][b];"
             f"[a]trim=start={f},setpts=PTS-STARTPTS[main];"
             f"[b]trim=0:{f},setpts=PTS-STARTPTS[head];"
             f"[main][head]xfade=transition=fade:duration={f}:offset={dur - 2 * f:.3f},format=yuv420p[v]")
    run(["ffmpeg", "-y", "-i", a.src, "-filter_complex", graph, "-map", "[v]", "-an",
         "-c:v", "libx264", "-crf", "12", "-preset", "medium", loop])
    run(["ffmpeg", "-y", "-i", loop, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "26",
         "-maxrate", "1.6M", "-bufsize", "3.2M", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
         os.path.join(OUT, "e-hero.mp4")])
    run(["ffmpeg", "-y", "-i", loop, "-an", "-c:v", "libvpx-vp9", "-b:v", "1.2M", "-crf", "36",
         "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
         os.path.join(OUT, "e-hero.webm")])
    # 第一格當靜態底圖（與影片完全對齊）
    run(["ffmpeg", "-y", "-i", loop, "-frames:v", "1", "-q:v", "3", os.path.join(OUT, "e-hero-poster.jpg")])
    for w in (960, 1440, 1920):
        run(["ffmpeg", "-y", "-i", os.path.join(OUT, "e-hero-poster.jpg"), "-vf", f"scale={w}:-2:flags=lanczos",
             "-c:v", "libwebp", "-quality", "78", os.path.join(OUT, f"e-hero-poster-{w}.webp")])
    os.remove(loop)
    for name in sorted(os.listdir(OUT)):
        if name.startswith("e-hero"):
            print(f"{name:28s} {os.path.getsize(os.path.join(OUT, name)) // 1024:6d} KB")
    print(f"完成：循環長度 {dur - f:.1f} 秒。把 index.html 的 ve-hero 設定 data-video=\"assets/video/e-hero\" 即可啟用。")


if __name__ == "__main__":
    main()
