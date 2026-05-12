import React from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Database, Globe, Lock, Trash2 } from 'lucide-react';

const Settings = () => {
  const sections = [
    { title: 'Profile Settings', desc: 'Update your personal info and avatar', icon: User },
    { title: 'Security & Auth', desc: 'Manage 2FA, passwords and active sessions', icon: Shield },
    { title: 'Troupe Config', desc: 'Set global production defaults and categories', icon: Database },
    { title: 'Notifications', desc: 'Configure system alerts and email reports', icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">System Settings</h2>
        <p className="text-white/40 text-sm mt-1">System Core</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {sections.map((section, i) => (
          <div key={i} className="flex items-center justify-between p-6 bg-[#121212] border border-white/5 hover:bg-white/5 transition-all group rounded-sm cursor-pointer">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-white/5 rounded-sm text-[#e5a00d] group-hover:bg-[#e5a00d] group-hover:text-black transition-all">
                 <section.icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white group-hover:text-[#e5a00d] transition-colors">{section.title}</h3>
                <p className="text-[11px] text-white/40 font-medium mt-1">{section.desc}</p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="btn-primary">Manage</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6">
        <div className="flex items-center gap-4 mb-4">
           <h3 className="text-sm font-bold text-red-500">Danger Zone</h3>
           <div className="flex-1 h-px bg-red-500/10" />
        </div>
        <div className="bg-[#0a0a0a] border border-red-500/20 p-8 rounded-sm flex justify-between items-center group">
           <div>
              <div className="font-bold text-white text-sm mb-1">Erase Troubleshooting Logs</div>
              <div className="text-[11px] text-red-500/60 font-medium">Permanent System Wipe • Irreversible</div>
           </div>
           <button className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 text-white/40 hover:text-white rounded-sm border border-red-500/20 text-sm font-bold transition-all">
              <Trash2 size={14} className="inline mr-2" /> Wipe Cache
           </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
