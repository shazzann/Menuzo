const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'AdminAddFoodPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Imports
content = content.replace(
  "import { Settings, Plus, Search, MoreVertical, Edit2, Trash2, Star, Check, X, Camera } from 'lucide-react';",
  "import { Settings, Plus, Search, MoreVertical, Edit2, Trash2, Star, Check, X, Camera, ArrowLeft, Image as ImageIcon } from 'lucide-react';"
);
content = content.replace(
  "import { cn } from '@/lib/utils';",
  "import { cn } from '@/lib/utils';\nimport { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/lib/cloudinary';\nimport { ImageCropperModal } from '@/components/shared/ImageCropperModal';"
);

// State
content = content.replace(
  "const [isDialogOpen, setIsDialogOpen] = useState(false);",
  "const [showForm, setShowForm] = useState(false);\n  const [cropModalOpen, setCropModalOpen] = useState(false);\n  const [cropImageSrc, setCropImageSrc] = useState<string>('');"
);

// handleOpenDialog -> handleOpenForm
content = content.replace(
  /const handleOpenDialog =/g,
  "const handleOpenForm ="
);
content = content.replace(
  /setIsDialogOpen\(true\);/g,
  "setShowForm(true);"
);
content = content.replace(
  /setIsDialogOpen\(false\);/g,
  "setShowForm(false);"
);
content = content.replace(
  /onClick=\{\(\) => handleOpenDialog/g,
  "onClick={() => handleOpenForm"
);

// Form handlers
const handlers = `
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCropImageSrc(url);
      setCropModalOpen(true);
    }
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    toast.loading('Uploading image...', { id: 'upload-food' });
    try {
      const { url } = await uploadImageToCloudinary(croppedFile);
      
      const oldUrl = formData.image;
      if (oldUrl && !oldUrl.startsWith('/')) {
        deleteImageFromCloudinary(oldUrl);
      }

      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded successfully', { id: 'upload-food' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image', { id: 'upload-food' });
    }
  };

  const handleRemoveImage = () => {
    const oldUrl = formData.image;
    if (oldUrl && !oldUrl.startsWith('/')) {
      deleteImageFromCloudinary(oldUrl);
    }
    setFormData(prev => ({ ...prev, image: '' }));
    toast.success('Image removed.');
  };

  const handleTabChange`;

content = content.replace(/const handleTabChange/g, handlers);

// Replace default image in initial state
content = content.replace(
  /image: '\/food-burger.jpg'/g,
  "image: ''"
);

// Image Upload Section in Form
const oldImageSection = `{/* Image */}
            <div className="relative h-40 rounded-xl overflow-hidden bg-muted group">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Upload Photo</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, image: URL.createObjectURL(file) });
                    }
                  }}
                />
              </label>
            </div>`;

const newImageSection = `{/* Image */}
            <div className="relative h-48 rounded-xl overflow-hidden bg-muted group flex items-center justify-center">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs font-medium">No Image Uploaded</span>
                </div>
              )}
              {formData.image && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                  onClick={handleRemoveImage}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Upload Photo</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageSelect}
                />
              </label>
            </div>`;
content = content.replace(oldImageSection, newImageSection);


// Replace entire UI structure
// First extract the Form inner content
const formInnerStart = `<div className="space-y-4 pt-4">`;
const formInnerEnd = `</div>
        </DialogContent>
      </Dialog>`;
const formInnerIndexStart = content.indexOf(formInnerStart);
const formInnerIndexEnd = content.indexOf(formInnerEnd) + `</div>`.length;
const formInnerContent = content.slice(formInnerIndexStart, formInnerIndexEnd);

// Then extract the List inner content
const listInnerStart = `{/* Admin Header */}`;
const listInnerEnd = `{/* Add/Edit Dialog */}`;
const listInnerIndexStart = content.indexOf(listInnerStart);
const listInnerIndexEnd = content.indexOf(listInnerEnd);
const listInnerContent = content.slice(listInnerIndexStart, listInnerIndexEnd);

const beforeList = content.slice(0, listInnerIndexStart);
const afterForm = content.slice(content.indexOf(formInnerEnd) + formInnerEnd.length);

const finalUI = `
      {showForm ? (
        <div className="min-h-screen bg-background pb-24">
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="-ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-semibold">{editingItem ? 'Edit Item' : 'Add New Item'}</h1>
            </div>
          </div>
          <div className="p-4 max-w-md mx-auto">
            ${formInnerContent}
          </div>
        </div>
      ) : (
        <>
          ${listInnerContent}
        </>
      )}

      <ImageCropperModal
        open={cropModalOpen}
        onOpenChange={setCropModalOpen}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        title="Crop Food Image"
      />
`;

content = beforeList + finalUI + afterForm;

// Fix Cancel Button in form
content = content.replace(
  /onClick=\{\(\) => setShowForm\(false\)\}\n                className="flex-1"\n              >\n                Cancel/,
  `onClick={() => setShowForm(false)} className="flex-1"> Cancel`
);


fs.writeFileSync(filePath, content);
console.log("Refactoring complete.");
