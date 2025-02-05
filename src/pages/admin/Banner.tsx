import { Edit, Eye, ImageIcon, Layout, Menu, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Banner } from "../../types/Banner";
import { configMultiPart, config } from "../../common/configurations";
import { commonRequest, URL } from "../../common/api";
import toast from "react-hot-toast";

const BannerComponent :React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [banners, setBanners] = useState<Banner[]>([]);

    const [newBanner, setNewBanner] = useState<Omit<Banner, '_id'>>({
    title: '',
    status: true,
    type: 'promotional',
    imageUrl: '',
    description: '',
    priority: 'low'
    });

    const [previewImage, setPreviewImage] = useState<string>('');

    const fetchBanners = async () => {
        try {
            const response = await commonRequest('GET',`${URL}/auth/all-banner`,{}, config);
            if(!response.success){
                toast.error(response?.message);
                return;
            }
            setBanners(response?.data);
        } catch (error) {
            console.log(error,"failed to fetch from server");
        }
    }

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setNewBanner({ ...newBanner, imageUrl: file });
        };
        reader.readAsDataURL(file);
    }
    };

    const handleCreateBanner = async () => {
        try {
            if (newBanner.description && newBanner.description.length > 50) {
                toast.error("Description should be less than 50 characters");
                setNewBanner({ ...newBanner, description: '' });
                return;
            }
            
            const formData = new FormData();
            formData.append('title', newBanner.title);
            formData.append('status', newBanner.status.toString());
            formData.append('type', newBanner.type);
            formData.append('description', newBanner.description || '');
            formData.append('priority', newBanner.priority as "high" | "medium" | "low");
    
            if (fileInputRef.current?.files?.[0]) {
                formData.append('files.banner', fileInputRef.current.files[0]); // Attach the file
            }
            
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const response = await commonRequest('POST', `${URL}/auth/multipart/add-banner`, formData, configMultiPart);
            
            if(!response?.success){
                toast.error(response.message)
            }

            if(response?.success){
                toast.success(response.message)
                fetchBanners();
            }    
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setNewBanner({
                title: '',
                status: true,
                type: 'promotional',
                imageUrl: '',
                description: '',
                priority: 'low'
            });
            setPreviewImage('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteBanner = async (id: string) => {
        try {
            const response = await commonRequest('DELETE', `${URL}/auth/delete-banner/${id}`, {}, config)
            if(!response?.success){
                toast.error(response?.message)
                return;
            }
            setBanners((prevBanners) => prevBanners.filter((banner) => banner._id !== id));
            toast.success(response?.message)
        } catch (error) {
            console.error("Delete error:", error);
        }
    }
    const handleEditCourse = (banner:Banner) => {
        try {
            console.log(banner,"edit banner");
            toast.success('Edit Banner coming soon!');
        } catch (error) {
            console.log(error);
        }
    }
    const handleToggleStatus = async (id: string, status: boolean) => {
        try {
            const response = await commonRequest('PUT', `${URL}/auth/banner/toggle-status/${id}`, { status }, config);
            if (!response?.success) {
                toast.error(response.message);
                return;
            }
            setBanners((prevBanners) => prevBanners.map((banner) => banner._id === id ? { ...banner, status: !status } : banner));
            toast.success(response.message);
        } catch (error) {
            console.error("Toggle status error:", error);
        }
    };
    
    

    return (
    <div className="flex min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
            {/* Banner Creation Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">Create New Banner</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                            </label>
                            <input
                            type="text"
                            value={newBanner.title}
                            placeholder="Title for the banner"
                            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                            value={newBanner.status? "active" : "inactive"}
                            onChange={(e) => setNewBanner({ ...newBanner, status: e.target.value === "active" ?  true : false })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                            value={newBanner.priority}
                            onChange={(e) => setNewBanner({ ...newBanner, priority: e.target.value as "high" | "medium" | "low"})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High <span className="text-gray-500 text-sm">(shows in top)</span></option>                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                            </label>
                            <select
                            value={newBanner.type}
                            onChange={(e) => setNewBanner({ ...newBanner, type: e.target.value as 'promotional' | 'announcement' | 'sale' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                            <option value="promotional">Promotional</option>
                            <option value="announcement">Announcement</option>
                            <option value="sale">Sale</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Banner Image
                            </label>
                            <div 
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewImage ? (
                                <img 
                                    src={previewImage} 
                                    alt="Preview" 
                                    className="w-full h-28 object-cover rounded-md"
                                />
                                ) : (
                                <>
                                    <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Click to upload image</p>
                                </>
                                )}
                                <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                />
                            </div>
                        </div>
                        <div>
                        <div className="my-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descritpion
                            </label>
                            <textarea
                            rows={2} 
                            value={newBanner.description || ''}
                            placeholder="description will be displayed on the banner"
                            onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleCreateBanner}
                    disabled={!newBanner.title || !newBanner.imageUrl}
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Banner
                </button>
            </div>

            {/* Banner List */}
            <div className="grid grid-cols-2 gap-6">
                
            {banners.length === 0 ? (
                <div className="bg-gray-300 rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-xl font-semibold">No Banners Found</h2>
                </div>
            ) : (banners.map((banner) => (
                <div key={banner?._id} className="bg-gray-300 rounded-lg shadow-md overflow-hidden">
                    {typeof banner?.imageUrl === "string" && banner?.imageUrl && (
                        <div className="aspect-w-16 aspect-h-9 relative group">
                            <img
                            src={banner?.imageUrl}
                            alt={banner?.title}
                            className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                            <button
                                onClick={() => handleEditCourse(banner!)}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 transform hover:scale-105 transition-transform"
                                title="Edit Category"
                            >
                                <Edit className="w-5 h-5 text-blue-600" />
                            </button>
                            
                            <button
                                onClick={() => handleDeleteBanner(banner?._id!)}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 transform hover:scale-105 transition-transform"
                                title="Delete Category"
                            >
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                            
                            <button
                                onClick={() => toast.success('View details coming soon!')}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 transform hover:scale-105 transition-transform"
                                title="View Details"
                            >
                                <Eye className="w-5 h-5 text-green-600" />
                            </button>
                            </div>
                        </div>
                    )}
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold mb-2">{banner?.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-sm bg-gray-400 text-gray-900 font-bold`}>
                                {banner?.priority}
                            </span>
                        </div>
                        <button className="flex items-center justify-between" onClick={() => handleToggleStatus(banner?._id!,banner.status!)}>
                            <span className={`px-2 py-1 rounded-full text-sm mx-2 hover:bg-slate-500 hover:text-sm ${
                                banner.status === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {banner?.status === true? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-sm text-gray-500 capitalize">{banner?.type}</span>
                        </button>
                        <div className="mx-auto mt-6 mb-4 px-4 sm:px-0 max-w-3xl">
                            <p className="text-md sm:text-lg text-gray-600 leading-relaxed tracking-normal truncate">
                                {banner?.description}
                            </p>
                        </div>
                    </div>
                    </div>
                 )))
                }
            </div>
        </div>
        </div>
    </div>
    );
}

export default BannerComponent;