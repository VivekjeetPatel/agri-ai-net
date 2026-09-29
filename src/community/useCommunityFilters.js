import { useCallback, useEffect, useMemo, useState } from 'react';

const readQuery = () => new URLSearchParams(window.location.search).get('crops')?.split(',').filter(Boolean) || [];

export function useCommunityFilters(currentUser) {
  const [selectedCrops, setSelectedCrops] = useState(readQuery);
  const [matchMyCrops, setMatchMyCrops] = useState(false);
  const effectiveCrops = useMemo(() => matchMyCrops ? currentUser.crops : selectedCrops, [currentUser.crops, matchMyCrops, selectedCrops]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (effectiveCrops.length) params.set('crops', effectiveCrops.join(','));
    else params.delete('crops');
    const query = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }, [effectiveCrops]);

  const toggleCrop = useCallback(crop => {
    setSelectedCrops(current => {
      const active = matchMyCrops ? currentUser.crops : current;
      return active.includes(crop) ? active.filter(item => item !== crop) : [...active, crop];
    });
    setMatchMyCrops(false);
  }, [currentUser.crops, matchMyCrops]);
  const clearCrops = useCallback(() => { setSelectedCrops([]); setMatchMyCrops(false); }, []);
  const selectCrop = useCallback(crop => { setMatchMyCrops(false); setSelectedCrops(current => current.includes(crop) ? current : [...current, crop]); }, []);
  return { selectedCrops: effectiveCrops, queryCrops: selectedCrops, matchMyCrops, setMatchMyCrops, toggleCrop, clearCrops, selectCrop };
}
