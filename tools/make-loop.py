"""把一段影片做成無縫循環的網頁首屏影片，並輸出對應的第一格靜態圖。

做法：把影片最後 FADE 秒和開頭 FADE 秒交叉淡化，結尾會自然融回開頭（不用倒播，攻擊方向不會反過來）。
輸出長度 = 原長度 - FADE；最後一格與第一格相同，循環播放時不會跳格。

用法：python3 tools/make-loop.py 原始影片.mp4 [--fade 1.0] [--width 1920] [--name e-hero] [--vf 額外濾鏡]
輸出：assets/video/<name>.mp4、<name>.webm、<name>-poster-{960,1440}.webp（原片寬 1920 以上時另有 -1920）
--vf 會在縮放前套用，例如用 delogo 遮掉生成錯的小字：--vf "delogo=x=1182:y=48:w=62:h=18"
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
                        "stream=width,height,avg_frame_rate:format=duration", "-of", "json", path],
                       check=True, capture_output=True, text=True)
    d = json.loads(r.stdout)
    st = d["streams"][0]
    num, den = st["avg_frame_rate"].split("/")
    return float(d["format"]["duration"]), float(num) / float(den or 1), int(st["width"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--fade", type=float, default=1.0, help="交叉淡化秒數")
    ap.add_argument("--width", type=int, default=1920)
    ap.add_argument("--name", default="e-hero")
    ap.add_argument("--vf", default="")
    a = ap.parse_args()
    dur, fps, src_w = probe(a.src)
    fps = round(fps) or 24          # 用實際平均幀率，避免標示 60fps 的檔案被複製出重複格
    width = min(a.width, src_w)     # 不放大，放大只會變糊又變大
    if dur < a.fade * 3:
        sys.exit(f"影片太短（{dur:.1f} 秒），至少要 {a.fade * 3:.1f} 秒")
    os.makedirs(OUT, exist_ok=True)
    loop = os.path.join(OUT, "_loop.mov")
    # main = [fade, end]；head = [0, fade]；main 的最後 fade 秒與 head 交叉淡化
    f = a.fade
    pre = (a.vf + ",") if a.vf else ""
    graph = (f"[0:v]{pre}fps={fps},scale={width}:-2:flags=lanczos,setsar=1,split[a][b];"
             f"[a]trim=start={f},setpts=PTS-STARTPTS[main];"
             f"[b]trim=0:{f},setpts=PTS-STARTPTS[head];"
             f"[main][head]xfade=transition=fade:duration={f}:offset={dur - 2 * f:.3f},format=yuv420p[v]")
    run(["ffmpeg", "-y", "-i", a.src, "-filter_complex", graph, "-map", "[v]", "-an",
         "-c:v", "libx264", "-crf", "12", "-preset", "medium", loop])
    run(["ffmpeg", "-y", "-i", loop, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "28",
         "-maxrate", "1.1M", "-bufsize", "2.2M", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
         os.path.join(OUT, a.name + ".mp4")])
    run(["ffmpeg", "-y", "-i", loop, "-an", "-c:v", "libvpx-vp9", "-b:v", "0.85M", "-crf", "38",
         "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
         os.path.join(OUT, a.name + ".webm")])
    # 第一格當靜態底圖（與影片完全對齊）
    # 1920 只在原片夠寬時才產生（放大沒有意義）；JPG 只是中間檔，網站用 WebP
    jpg = os.path.join(OUT, "_poster.jpg")
    run(["ffmpeg", "-y", "-i", loop, "-frames:v", "1", "-q:v", "3", jpg])
    for w in (960, 1440, 1920):
        if w == 1920 and width < 1920:
            continue
        run(["ffmpeg", "-y", "-i", jpg, "-vf", f"scale={w}:-2:flags=lanczos",
             "-c:v", "libwebp", "-quality", "78", os.path.join(OUT, f"{a.name}-poster-{w}.webp")])
    os.remove(jpg)
    os.remove(loop)
    for name in sorted(os.listdir(OUT)):
        if name.startswith(a.name + ".") or name.startswith(a.name + "-poster"):
            print(f"{name:28s} {os.path.getsize(os.path.join(OUT, name)) // 1024:6d} KB")
    print(f"完成：{width}px、{fps}fps，循環長度 {dur - f:.1f} 秒。")


if __name__ == "__main__":
    main()
