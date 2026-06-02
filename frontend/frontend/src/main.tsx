cat > ~/inventory-management-system/frontend/frontend/src/main.tsx << 'EOF'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import App from './App'

createRoot(document.getElementById('app')!).render(createElement(App))
EOF