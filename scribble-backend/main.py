import sys #importing the sys module to access command-line arguments

from moviepy import (
    ColorClip,
    VideoFileClip,
    TextClip,
    ImageClip,
    CompositeVideoClip
)

import os

# vedio and image paths 

video_path = sys.argv[1] # the first command-line argument is the path to the video file
image_path = os.path.join("branding", "logo.png") # if you want to add a logo to the video you can add it in the branding folder


# Output path its name is scribble.mp4 and it will be saved in the outputs folder

output_path = os.path.join(
    "outputs",
    "scribble.mp4"
)

# Video clip

clip = VideoFileClip(video_path).with_volume_scaled(0.8)


# tik tok video dimensions

W, H = 1080, 1920


# background composition and resizing the video to fit the tik tok dimensions

background = ColorClip(size=(W, H), color=(0, 0, 0)).with_duration(clip.duration)
video_resized = clip.resized(height=1400).with_position("center")
border =  ColorClip(size=(W, H), color=(0, 0, 0)).with_opacity(0).with_duration(clip.duration)


# Text clip

txt_clip = (
    TextClip(
        text="HELLO SCRIBBLE BOOTH!",
        font_size=55,
        color="white",
        stroke_color="black",
        stroke_width=2,
        size=(clip.w, 80),
        text_align="center"
    )
    .with_duration(clip.duration)
    .with_position(("center", H - 180))
)


# Logo clip

logo_clip = (
    ImageClip(image_path)
    .with_duration(clip.duration)
    .resized(height=100)
    .with_position(("left", "top"))
)

# Final video composition

final_video = CompositeVideoClip([
    background,
    video_resized,
    logo_clip,
    txt_clip,
    border
], size=(W, H))

# final video export 

final_video.write_videofile(
    output_path,
    codec="libx264",
    audio_codec="aac",
    fps=30
)

print("Python script started")
print("scribble.mp4 created")