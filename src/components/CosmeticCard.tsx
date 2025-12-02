import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cosmetic } from '../types';
import { useAuth, API_BASE_URL_CONST as API_BASE_URL } from '../context/AuthContext';
import { Badge } from './Badge';

export const CosmeticCard: React.FC<{ item: Cosmetic; showRefund?: boolean }> = ({ item, showRefund = false }) => {
    const { user, refreshUser } = useAuth();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const isOwned = user?.inventory.includes(item.id);

    let rarityColor = 'border-gray-600 bg-gray-800';
    if (item.rarity?.value === 'legendary') rarityColor = 'border-orange-500 bg-orange-900/20';
    else if (item.rarity?.value === 'epic') rarityColor = 'border-purple-500 bg-purple-900/20';
    else if (item.rarity?.value === 'rare') rarityColor = 'border-blue-500 bg-blue-900/20';
    else if (item.rarity?.value === 'uncommon') rarityColor = 'border-green-500 bg-green-900/20';

    const handleQuickRefund = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || isProcessing) return;
        if (!confirm(`Deseja devolver o item "${item.name}"?`)) return;

        setIsProcessing(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/refund`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    itemId: item.id,
                    amount: item.price || 0
                }),
            });
            if (!response.ok) throw new Error('Falha ao processar reembolso.');
            await refreshUser();
            setTimeout(() => alert("Item devolvido com sucesso!"), 100);
        } catch (err: any) {
            alert("Erro na devolução: " + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={`group flex flex-col rounded-xl overflow-hidden border-2 ${rarityColor} transition-all hover:scale-105 hover:shadow-2xl hover:shadow-fortnite-purple/50 h-full relative`}>
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-20 pointer-events-none">
                {item.isNew && <Badge color="bg-fortnite-yellow text-black" text="NOVO" />}
                {item.isOnSale && <Badge color="bg-red-500 text-white" text="LOJA" />}
                {item.isPromotional && <Badge color="bg-green-500 text-white" text="PROMO" />}
            </div>

            {isOwned && (
                <div className="absolute top-2 right-2 z-20 bg-fortnite-blue text-white p-1 rounded-full shadow-lg pointer-events-none" title="Adquirido">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
            )}

            <Link to={`/cosmetic/${item.id}`} className="aspect-square overflow-hidden bg-gray-900 relative block z-10">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-slate-700 animate-pulse flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                )}
                <img
                    src={item.images?.featured || item.images?.icon || item.images?.smallIcon}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-opacity duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                />
                {!isOwned && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-white font-bold uppercase tracking-widest text-sm border border-white px-4 py-2">Ver Detalhes</span>
                    </div>
                )}
            </Link>

            <div className="p-3 flex flex-col flex-grow bg-slate-800/90 backdrop-blur-sm z-30 relative">
                <Link to={`/cosmetic/${item.id}`} className="block">
                    <h3 className="text-white font-bold text-sm truncate hover:text-fortnite-yellow transition-colors">{item.name}</h3>
                    <p className="text-gray-400 text-xs truncate">{item.rarity?.displayValue || 'Comum'} &bull; {item.type?.displayValue}</p>
                </Link>

                <div className="mt-auto pt-2 min-h-[40px] flex items-end">
                    {isOwned ? (
                        showRefund ? (
                            <button onClick={handleQuickRefund} disabled={isProcessing} className="relative w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1 group/btn z-50 border border-red-400/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                {isProcessing ? '...' : 'Devolução'}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-slate-900 text-white text-[10px] p-2 rounded border border-slate-700 shadow-xl opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none normal-case leading-snug text-center z-[60]">
                                    Devolver item e receber V-Bucks de volta
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                            </button>
                        ) : (
                            <div className="w-full text-center text-fortnite-blue font-bold text-xs py-2 border border-fortnite-blue/30 rounded bg-fortnite-blue/10">ADQUIRIDO</div>
                        )
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            {item.price ? (
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded-full bg-fortnite-yellow"></div>
                                    <span className="text-white font-bold text-sm">{item.price}</span>
                                    {item.regularPrice && item.regularPrice > item.price && (
                                        <span className="text-gray-500 text-xs line-through ml-1">{item.regularPrice}</span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-gray-500 text-xs">Indisponível</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};