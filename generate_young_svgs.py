import os

crop_data = {
    'corn': {'color': '#75c84a', 'paths': ['M 32 80 Q 20 50 10 30 Q 30 40 32 60', 'M 32 80 Q 44 50 54 30 Q 34 40 32 60', 'M 32 80 Q 32 40 32 10 Q 38 40 32 60']},
    'chili': {'color': '#4da638', 'paths': ['M 32 80 Q 15 60 5 40 Q 25 55 32 70', 'M 32 80 Q 49 60 59 40 Q 39 55 32 70', 'M 32 80 L 32 50', 'M 32 60 Q 20 40 15 20 Q 28 35 32 50', 'M 32 60 Q 44 40 49 20 Q 36 35 32 50']},
    'cabbage': {'color': '#9ee37d', 'paths': ['M 32 80 Q 5 70 5 40 Q 32 20 32 80', 'M 32 80 Q 59 70 59 40 Q 32 20 32 80', 'M 32 80 Q 20 50 32 30 Q 44 50 32 80']},
    'tomato': {'color': '#3a8726', 'paths': ['M 32 80 C 32 60 20 50 10 40 C 25 40 30 50 32 65', 'M 32 80 C 32 60 44 50 54 40 C 39 40 34 50 32 65', 'M 32 65 L 32 30', 'M 32 45 C 20 35 15 20 15 20 C 25 25 30 35 32 45', 'M 32 45 C 44 35 49 20 49 20 C 39 25 34 35 32 45']},
    'eggplant': {'color': '#57964b', 'paths': ['M 32 80 C 20 70 10 50 15 40 C 25 50 30 65 32 80', 'M 32 80 C 44 70 54 50 49 40 C 39 50 34 65 32 80', 'M 32 80 C 25 50 15 30 25 20 C 30 35 32 55 32 80', 'M 32 80 C 39 50 49 30 39 20 C 34 35 32 55 32 80']},
    'carrot': {'color': '#a3e856', 'paths': ['M 32 80 Q 20 60 10 20 Q 25 40 32 80', 'M 32 80 Q 44 60 54 20 Q 39 40 32 80', 'M 32 80 Q 26 50 25 10 Q 32 40 32 80', 'M 32 80 Q 38 50 39 10 Q 32 40 32 80']},
    'onion': {'color': '#bfe892', 'paths': ['M 32 80 Q 25 50 15 10 Q 28 40 32 80', 'M 32 80 Q 39 50 49 10 Q 36 40 32 80', 'M 32 80 Q 30 40 30 5 Q 34 40 32 80']},
    'cauliflower': {'color': '#63ab46', 'paths': ['M 32 80 C 10 80 5 50 15 40 C 25 45 30 60 32 80', 'M 32 80 C 54 80 59 50 49 40 C 39 45 34 60 32 80', 'M 32 80 C 15 60 10 30 25 25 C 30 40 32 60 32 80', 'M 32 80 C 49 60 54 30 39 25 C 34 40 32 60 32 80']}
}

svg_template = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 88" width="64" height="88">
  <g fill="{color}" stroke="#1f420e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    {paths}
  </g>
</svg>"""

out_dir = '/Users/clawbot/.openclaw/workspace-yunshu/planting_game/assets/crops'
for crop, data in crop_data.items():
    path_tags = "\n    ".join(f'<path d="{p}" />' for p in data['paths'])
    svg_content = svg_template.format(color=data['color'], paths=path_tags)
    
    with open(os.path.join(out_dir, f'young_{crop}.svg'), 'w') as f:
        f.write(svg_content)

print("Generated SVG files.")
