import os, re

frontend_dir = r"d:\coding\jango\projects\final project\frontend\src"
auth_import = "import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';\n"
auth_import_at = "import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/auth';\n"

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if not file.endswith(('.ts', '.tsx')): continue
        filepath = os.path.join(root, file)
        if 'lib\\auth' in filepath: continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        orig_content = content
        
        # Replacements
        content = re.sub(r"localStorage\.getItem\(['\"]accessToken['\"]\)", 'getAccessToken()', content)
        content = re.sub(r"localStorage\.getItem\(['\"]refreshToken['\"]\)", 'getRefreshToken()', content)
        
        # Deduplicate clearTokens replacing both removeItem('accessToken') and removeItem('refreshToken') and removeItem('token')
        content = re.sub(r"localStorage\.removeItem\(['\"]accessToken['\"]\);?", 'clearTokens();', content)
        content = re.sub(r"localStorage\.removeItem\(['\"]refreshToken['\"]\);?", 'clearTokens();', content)
        content = re.sub(r"localStorage\.removeItem\(['\"]token['\"]\);?", 'clearTokens();', content)
        content = re.sub(r"(clearTokens\(\);\s*)+", 'clearTokens();\n', content)
        
        # setItem replacement
        # if both are set consecutively
        content = re.sub(r"localStorage\.setItem\(['\"]accessToken['\"],\s*([^)]+)\);\s*localStorage\.setItem\(['\"]refreshToken['\"],\s*([^)]+)\);", r'setTokens(\1, \2);', content)
        
        if content != orig_content:
            # Determine import path
            depth = filepath.replace(frontend_dir, '').count(os.sep)
            # wait, if vite is configured with @ for src, we can just use @/lib/auth
            # let's just use @/lib/auth for all if @ is in tsconfig, but let's check
            # if we use relative:
            if depth == 1:
                rel_import = "import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './lib/auth';\n"
            else:
                rel_import = "import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '" + "../"*(depth-1) + "lib/auth';\n"
            
            # Put import at the top after other imports or just at top
            if 'import ' in content:
                content = rel_import + content
            else:
                content = rel_import + content
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
