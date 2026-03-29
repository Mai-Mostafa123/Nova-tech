import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Category, Product } from '../types';
import { storefrontApi } from '../services/storefrontApi';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    categoryId: product?.categoryId || 1,
    brand: product?.brand || '',
    stock: product?.stock || 0,
    discount: product?.discount || 0,
    images: product?.images?.length ? product.images : [''],
    colors: product?.colors?.join(', ') || '',
    sizes: product?.sizes?.join(', ') || '',
    tags: product?.tags?.join(', ') || '',
    specificationsText: Object.entries(product?.specifications || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n'),
    freeShipping: product?.freeShipping || false,
    featured: product?.featured || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    storefrontApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  const parseSpecifications = () =>
    Object.fromEntries(
      formData.specificationsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [key, ...rest] = line.split(':');
          return [key.trim(), rest.join(':').trim()];
        })
        .filter(([key, value]) => key && value)
    );

  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        categoryId: Number(formData.categoryId),
        brand: formData.brand,
        stock: Number(formData.stock),
        discount: Number(formData.discount),
        images: formData.images.filter(Boolean),
        colors: parseList(formData.colors),
        sizes: parseList(formData.sizes),
        tags: parseList(formData.tags),
        specifications: parseSpecifications(),
        freeShipping: formData.freeShipping,
        featured: formData.featured,
      };

      if (product) {
        await storefrontApi.updateProduct(product.id, payload);
        toast.success('Product updated successfully');
      } else {
        await storefrontApi.createProduct(payload);
        toast.success('Product added successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateImage = (index: number, value: string) => {
    const nextImages = [...formData.images];
    nextImages[index] = value;
    setFormData((prev) => ({ ...prev, images: nextImages }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Product Name</label>
              <input required type="text" value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Category</label>
              <select value={formData.categoryId} onChange={(event) => setFormData((prev) => ({ ...prev, categoryId: Number(event.target.value) }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none">
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Description</label>
            <textarea required rows={4} value={formData.description} onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Price</label>
              <input required type="number" value={formData.price} onChange={(event) => setFormData((prev) => ({ ...prev, price: Number(event.target.value) }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Stock</label>
              <input required type="number" value={formData.stock} onChange={(event) => setFormData((prev) => ({ ...prev, stock: Number(event.target.value) }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Discount</label>
              <input type="number" value={formData.discount} onChange={(event) => setFormData((prev) => ({ ...prev, discount: Number(event.target.value) }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Brand</label>
              <input type="text" value={formData.brand} onChange={(event) => setFormData((prev) => ({ ...prev, brand: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Colors</label>
              <input value={formData.colors} onChange={(event) => setFormData((prev) => ({ ...prev, colors: event.target.value }))} placeholder="Black, Silver, Blue" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Sizes / Storage</label>
              <input value={formData.sizes} onChange={(event) => setFormData((prev) => ({ ...prev, sizes: event.target.value }))} placeholder="128GB, 256GB, XL" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Tags</label>
              <input value={formData.tags} onChange={(event) => setFormData((prev) => ({ ...prev, tags: event.target.value }))} placeholder="featured, gaming, premium" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Product Images (URLs)</label>
            {formData.images.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input type="url" value={url} onChange={(event) => updateImage(index, event.target.value)} className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => {
                      const nextImages = prev.images.filter((_, itemIndex) => itemIndex !== index);
                      return { ...prev, images: nextImages.length ? nextImages : [''] };
                    })
                  }
                  className="rounded-xl p-3 text-red-500 transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }))} className="flex items-center gap-2 text-xs font-bold text-emerald-500 hover:underline">
              <Plus className="h-4 w-4" /> Add Another Image
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Specifications</label>
            <textarea rows={5} value={formData.specificationsText} onChange={(event) => setFormData((prev) => ({ ...prev, specificationsText: event.target.value }))} placeholder={'processor: M3 Ultra\nram: 128GB\nstorage: 2TB SSD'} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3 text-sm text-white/60">
              <input type="checkbox" checked={formData.freeShipping} onChange={(event) => setFormData((prev) => ({ ...prev, freeShipping: event.target.checked }))} className="h-4 w-4 rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-emerald-500" />
              Offer Free Shipping
            </label>
            <label className="flex items-center gap-3 text-sm text-white/60">
              <input type="checkbox" checked={formData.featured} onChange={(event) => setFormData((prev) => ({ ...prev, featured: event.target.checked }))} className="h-4 w-4 rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-emerald-500" />
              Featured Product
            </label>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-white/10 bg-white/5 py-4 text-sm font-bold text-white transition-all hover:bg-white/10">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-full bg-emerald-500 py-4 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
