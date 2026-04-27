import os

svg_template = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  {content}
</svg>"""

buildings = {
    'farm': """
      <path d="M 10 90 L 10 50 L 50 20 L 90 50 L 90 90 Z" fill="#d4a373" stroke="#5c3a21" stroke-width="4"/>
      <path d="M 5 50 L 50 15 L 95 50 L 85 55 L 50 25 L 15 55 Z" fill="#e07a5f" stroke="#5c3a21" stroke-width="4"/>
      <rect x="40" y="60" width="20" height="30" fill="#815ac0" stroke="#5c3a21" stroke-width="4"/>
      <rect x="20" y="60" width="15" height="15" fill="#a8dadc" stroke="#5c3a21" stroke-width="3"/>
      <rect x="65" y="60" width="15" height="15" fill="#a8dadc" stroke="#5c3a21" stroke-width="3"/>
    """,
    'storage': """
      <path d="M 15 90 L 15 40 L 50 10 L 85 40 L 85 90 Z" fill="#a44a3f" stroke="#4a2019" stroke-width="4"/>
      <path d="M 5 45 L 50 5 L 95 45 L 85 55 L 50 20 L 15 55 Z" fill="#e07a5f" stroke="#4a2019" stroke-width="4"/>
      <path d="M 30 90 L 30 50 L 70 50 L 70 90" fill="none" stroke="#4a2019" stroke-width="4"/>
      <line x1="30" y1="50" x2="70" y2="90" stroke="#4a2019" stroke-width="4"/>
      <line x1="70" y1="50" x2="30" y2="90" stroke="#4a2019" stroke-width="4"/>
    """,
    'shop': """
      <path d="M 10 90 L 10 60 L 90 60 L 90 90 Z" fill="#f4a261" stroke="#5c3a21" stroke-width="4"/>
      <path d="M 5 60 L 20 20 L 80 20 L 95 60 Z" fill="#2a9d8f" stroke="#5c3a21" stroke-width="4"/>
      <rect x="35" y="60" width="30" height="30" fill="#e76f51" stroke="#5c3a21" stroke-width="4"/>
      <path d="M 20 20 L 35 60 M 40 20 L 50 60 M 60 20 L 65 60 M 80 20 L 80 60" stroke="#e9c46a" stroke-width="4"/>
    """
}

out_dir = '/Users/clawbot/.openclaw/workspace-yunshu/planting_game/assets/buildings'
os.makedirs(out_dir, exist_ok=True)

for name, content in buildings.items():
    with open(os.path.join(out_dir, f'{name}.svg'), 'w') as f:
        f.write(svg_template.format(content=content))

print("Generated Building SVGs.")
