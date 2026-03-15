import { Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface EditGroupModalProps {
    initialName: string;
    initialDescription: string;
    onSave: (name: string, description: string) => Promise<void>;
    onCancel: () => void;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
    initialName,
    initialDescription,
    onSave,
    onCancel,
}) => {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setName(initialName);
        setDescription(initialDescription || '');
    }, [initialName, initialDescription]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Group name is required');
            return;
        }

        try {
            setLoading(true);
            await onSave(name.trim(), description.trim());
        } catch (error) {
            console.error('Failed to update group:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden'>
                <div className='p-6 border-b border-gray-100 flex justify-between items-center'>
                    <h2 className='text-xl font-semibold text-gray-800'>Edit Group</h2>
                    <button
                        onClick={onCancel}
                        className='text-gray-400 hover:text-gray-600 transition'
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Group Name
                        </label>
                        <input
                            type='text'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent'
                            placeholder='e.g., Apartment, Vacation'
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent'
                            placeholder='Add any details about this group'
                            rows={3}
                        />
                    </div>

                    <div className='flex gap-4 pt-4'>
                        <button
                            type='button'
                            onClick={onCancel}
                            className='flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2'
                        >
                            {loading ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGroupModal;
