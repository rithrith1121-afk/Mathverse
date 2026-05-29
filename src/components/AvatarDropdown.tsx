import React, { useState, useRef } from 'react';
import { User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AvatarDropdownProps {
  userId: string;
  email?: string | null;
  avatarUrl?: string | null;
  onLogout: () => void;
  onViewProfile: () => void;
  onAvatarChange?: (url: string) => void;
}

export default function AvatarDropdown({ userId, email, avatarUrl, onLogout, onViewProfile, onAvatarChange }: AvatarDropdownProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleMenu = () => setOpen(!open);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please select a jpg, jpeg, png, or webp image.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const extension = file.name.split('.').pop();
      const filePath = `${userId}/profile.${extension}`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      const urlWithTs = `${publicUrl}?t=${Date.now()}`;
      const { error: updateErr } = await supabase.from('profiles').update({ avatar_url: urlWithTs }).eq('id', userId);
      if (updateErr) throw updateErr;
      // Update avatar in parent state if callback provided
      if (onAvatarChange) {
        onAvatarChange(urlWithTs);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const initials = email ? email[0].toUpperCase() : '?';

  return (
    <div className="relative inline-block text-left">
      <button onClick={toggleMenu} className="flex items-center gap-2 focus:outline-none" aria-haspopup="true" aria-expanded={open}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border-2 border-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.5)]" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center border-2 border-cyan-400 text-sm font-mono text-cyan-200">
            {initials}
          </div>
        )}
        <User className="w-4 h-4 text-cyan-400" />
      </button>
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#0a0e1a] border border-cyan-500/30 ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1">
            <button onClick={onViewProfile} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-cyan-500/10 flex items-center gap-2">
              <User className="w-4 h-4" /> View Profile
            </button>
            <button onClick={openFilePicker} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-cyan-500/10 flex items-center gap-2" disabled={uploading}>
              {uploading ? (
                <span className="animate-pulse text-xs">Uploading...</span>
              ) : (
                <>
                  <User className="w-4 h-4" /> Change Photo
                </>
              )}
            </button>
            <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-cyan-500/10 flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
            {error && (
              <p className="px-4 py-2 text-xs text-red-400">{error}</p>
            )}
          </div>
        </div>
      )}
      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
}
