import os, re

frontend_dir = r"d:\coding\jango\projects\final project\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    orig_content = content
    
    # Simple replaces for API base url strings
    content = content.replace("'http://localhost:8000/api/v1", "API_BASE_URL + '/api/v1")
    content = content.replace('"http://localhost:8000/api/v1', "API_BASE_URL + '/api/v1")
    content = content.replace("`http://localhost:8000/api/v1", "`${API_BASE_URL}/api/v1")
    content = content.replace("http://localhost:8000/api/v1", "${API_BASE_URL}/api/v1")
    
    # In some places it might just be 'http://localhost:8000'
    content = content.replace("'http://localhost:8000'", "API_BASE_URL")
    content = content.replace('"http://localhost:8000"', "API_BASE_URL")
    
    # Websockets
    content = content.replace("'ws://localhost:8000/ws", "WS_BASE_URL + '/ws")
    content = content.replace('"ws://localhost:8000/ws', "WS_BASE_URL + '/ws")
    content = content.replace("`ws://localhost:8000/ws", "`${WS_BASE_URL}/ws")
    
    if content != orig_content:
        # Determine import path
        depth = filepath.replace(frontend_dir, '').count(os.sep)
        
        if depth == 1:
            rel_import = "import { API_BASE_URL, WS_BASE_URL } from './lib/config';\n"
        else:
            rel_import = "import { API_BASE_URL, WS_BASE_URL } from '" + "../"*(depth-1) + "lib/config';\n"
        
        # Don't add if already there
        if 'lib/config' not in content:
            if 'import ' in content:
                content = rel_import + content
            else:
                content = rel_import + content
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if not file.endswith(('.ts', '.tsx')): continue
        filepath = os.path.join(root, file)
        if 'lib\\config' in filepath: continue
        process_file(filepath)
