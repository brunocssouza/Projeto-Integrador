// Test component to verify registration and login functionality

export default function TestRegistration() {
  // This is just a test page to demonstrate the registration system
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="font-headline-lg text-primary font-bold text-2xl mb-4 text-center">
          Sistema de Cadastro
        </h1>
        <p className="text-on-surface-variant mb-6 text-center">
          O sistema de cadastro foi implementado com:
        </p>
        <ul className="space-y-3 mb-6">
          <li className="flex items-start">
            <span className="material-symbols-outlined text-green-500 mr-2">check</span>
            <span>Multi-step form com transições suaves</span>
          </li>
          <li className="flex items-start">
            <span className="material-symbols-outlined text-green-500 mr-2">check</span>
            <span>Validação de campos em tempo real</span>
          </li>
          <li className="flex items-start">
            <span className="material-symbols-outlined text-green-500 mr-2">check</span>
            <span>Armazenamento local (JSON) para usuários</span>
          </li>
          <li className="flex items-start">
            <span className="material-symbols-outlined text-green-500 mr-2">check</span>
            <span>Sistema de login com verificação de credenciais</span>
          </li>
        </ul>
        <div className="text-center">
          <p className="text-on-surface-variant text-sm">
            Para testar:
          </p>
          <ol className="text-left text-sm mt-2 space-y-1">
            <li>1. Acesse /register para criar uma conta</li>
            <li>2. Faça login em /login com suas credenciais</li>
            <li>3. Os dados são armazenados no localStorage</li>
          </ol>
        </div>
      </div>
    </div>
  );
}