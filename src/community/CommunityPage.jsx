import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, Check, ChevronDown, ChevronUp, Heart, ImagePlus, Leaf, MessageCircle, Search, Send, Share2, ShieldCheck, UserPlus } from 'lucide-react';
import { communityData, connect as connectRequest, createPost, getFarmers, getPosts, likePost } from './communityService.js';
import { useCommunityFilters } from './useCommunityFilters.js';
import { useTranslation } from 'react-i18next';
import { labelToLanguageCode } from '../i18n/languageCatalog.js';

const cropEmoji = Object.fromEntries(communityData.crops.map(crop => [crop.id, crop.icon]));
const localeFor = language => ({ Hindi: 'hi-IN', Punjabi: 'pa-IN', Marathi: 'mr-IN', Tamil: 'ta-IN', Telugu: 'te-IN', Gujarati: 'gu-IN', 'Portuguese (Brazil)': 'pt-BR', Russian: 'ru-RU', 'Mandarin (China)': 'zh-CN', 'Zulu (South Africa)': 'zu-ZA', 'English (South Africa / Global)': 'en-ZA', 'English (South Africa)': 'en-ZA' }[language] || 'en-IN');
const formatNumber = (value, language) => new Intl.NumberFormat(localeFor(language), { maximumFractionDigits: 1 }).format(value);
const cropLabel = (id, language, t) => t(`crops.${id}`, { lng: labelToLanguageCode[language] || language || 'en', defaultValue: communityData.crops.find(crop => crop.id === id)?.label || id });
const initials = name => name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
const ago = (date, language) => {
  const hours = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 3600000));
  const rtf = new Intl.RelativeTimeFormat(localeFor(language), { numeric: 'auto' });
  return hours < 24 ? rtf.format(-hours, 'hour') : rtf.format(-Math.floor(hours / 24), 'day');
};
const readConnections = () => { try { return JSON.parse(localStorage.getItem('fieldwise-community-connections') || '{}'); } catch { return {}; } };

export default function CommunityPage({ language = 'English', onDataChange = () => {} }) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [postLimit, setPostLimit] = useState(5);
  const [connections, setConnections] = useState(readConnections);
  const [query, setQuery] = useState('');
  const [showAllFarmers, setShowAllFarmers] = useState(false);
  const [toast, setToast] = useState('');
  const [newText, setNewText] = useState('');
  const [newCrop, setNewCrop] = useState('');
  const [newImage, setNewImage] = useState('');
  const filters = useCommunityFilters(communityData.currentUser);

  useEffect(() => {
    let live = true;
    const beganAt = Date.now();
    Promise.all([getPosts(), getFarmers()]).then(([loadedPosts, loadedFarmers]) => {
      window.setTimeout(() => {
        if (!live) return;
        setPosts(loadedPosts);
        setFarmers(loadedFarmers);
        onDataChange({ posts: loadedPosts, farmers: loadedFarmers });
        setLoading(false);
      }, Math.max(0, 600 - (Date.now() - beganAt)));
    });
    return () => { live = false; };
  }, []);

  const filteredPosts = useMemo(() => (posts ?? []).filter(post => !filters.selectedCrops.length || post.crops?.some(crop => filters.selectedCrops.includes(crop))), [posts, filters.selectedCrops]);
  const filteredFarmers = useMemo(() => (farmers ?? []).filter(farmer => !filters.selectedCrops.length || farmer.crops?.some(crop => filters.selectedCrops.includes(crop))).filter(farmer => !connections[farmer.id]?.startsWith('connected')).filter(farmer => `${farmer.name} ${farmer.village} ${farmer.state}`.toLowerCase().includes(query.trim().toLowerCase())).map(farmer => ({ ...farmer, shared: farmer.crops.filter(crop => communityData.currentUser.crops.includes(crop)) })).sort((a, b) => b.shared.length - a.shared.length), [farmers, filters.selectedCrops, connections, query]);
  const connectedFarmers = useMemo(() => (farmers ?? []).filter(farmer => connections[farmer.id]?.startsWith('connected')), [farmers, connections]);
  const cropLabelList = communityData.crops;
  const shownPosts = filteredPosts.slice(0, postLimit);
  const totalConnections = connectedFarmers.length;

  useEffect(() => { try { localStorage.setItem('fieldwise-community-connections', JSON.stringify(connections)); } catch { /* Demo preference only. */ } }, [connections]);
  useEffect(() => { onDataChange({ posts: filteredPosts, farmers: filteredFarmers }); }, [filteredPosts, filteredFarmers, onDataChange]);
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(''), 2500); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const pending = Object.entries(connections).filter(([, status]) => status === 'pending');
    const timers = pending.map(([id]) => window.setTimeout(() => setConnections(current => current[id] === 'pending' ? ({ ...current, [id]: `connected:${Date.now()}` }) : current), 1200));
    return () => timers.forEach(window.clearTimeout);
  }, [connections]);
  useEffect(() => {
    const onMessage = event => notify(`${t('community.messageReady')} ${event.detail?.name || ''}`.trim());
    window.addEventListener('fieldwise-community-message', onMessage);
    return () => window.removeEventListener('fieldwise-community-message', onMessage);
  }, []);

  const notify = message => { setToast(message); };
  const onPost = async event => {
    event.preventDefault();
    if (!newText.trim() || !newCrop) return;
    const created = await createPost({ authorId: communityData.currentUser.id, type: 'tip', caption: newText.trim(), image: newImage, crops: [newCrop] });
    const nextPosts = [created, ...posts];
    setPosts(nextPosts);
    onDataChange({ posts: nextPosts });
    setNewText(''); setNewCrop(''); setNewImage(''); setPostLimit(current => Math.max(5, current));
    notify(t('community.toast.posted'));
  };
  const onConnect = async farmer => {
    if (connections[farmer.id] === 'pending') { setConnections(current => ({ ...current, [farmer.id]: 'idle' })); return; }
    if (connections[farmer.id]?.startsWith('connected')) return;
    setConnections(current => ({ ...current, [farmer.id]: 'pending' }));
    notify(`${t('community.toast.request')} ${farmer.name}`);
    await connectRequest(farmer.id);
  };
  const toggleLike = async postId => {
    setPosts(current => current.map(post => post.id === postId ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post));
    await likePost(postId);
  };
  const toggleSaved = id => setPosts(current => current.map(post => post.id === id ? { ...post, saved: !post.saved } : post));
  const addComment = (postId, text) => setPosts(current => current.map(post => post.id === postId ? { ...post, comments: [...post.comments, { id: `local-comment-${Date.now()}`, authorId: communityData.currentUser.id, text, createdAt: new Date().toISOString() }] } : post));
  const share = async post => {
    const link = `${window.location.origin}${window.location.pathname}?post=${encodeURIComponent(post.id)}`;
    try { await navigator.clipboard.writeText(link); } catch { /* Clipboard may require secure context. */ }
    notify(t('community.toast.copied'));
  };
  return <section className="community-page" aria-labelledby="community-title">
    <div className="community-heading" data-read-id="community-intro"><div><span className="section-kicker">FIELDWISE {t('community.title').toLocaleUpperCase()}</span><h1 id="community-title">{t('community.title')}</h1><p>{t('community.subtitle')}</p></div><div className="community-result-count" aria-live="polite">{t('community.resultCount', { posts: formatNumber(filteredPosts.length, language), farmers: formatNumber(filteredFarmers.length, language) })}</div></div>
    <CropFilterBar selected={filters.selectedCrops} crops={cropLabelList} language={language} onToggle={filters.toggleCrop} onClear={filters.clearCrops}/>
    <div className="community-mobile-tabs" role="tablist" aria-label={t('community.sections')}><button role="tab" aria-selected={activeTab === 'feed'} onClick={() => setActiveTab('feed')}>{t('community.feedTab')}</button><button role="tab" aria-selected={activeTab === 'connect'} onClick={() => setActiveTab('connect')}>{t('community.connectTab')}</button></div>
    <div className="community-layout">
      <section className={`community-feed ${activeTab !== 'feed' ? 'mobile-hidden' : ''}`} aria-label={t('community.feed')}>
        <PostComposer text={newText} onText={setNewText} selectedCrop={newCrop} onCrop={setNewCrop} image={newImage} onImage={setNewImage} onPost={onPost} language={language}/>
        {loading ? <div className="community-post-list" aria-label={t('community.loading')}><SkeletonPost/><SkeletonPost/></div> : shownPosts.length ? <div className="community-post-list">{shownPosts.map(post => <PostCard key={post.id} post={post} author={communityData.currentUser.id === post.authorId ? communityData.currentUser : farmers.find(farmer => farmer.id === post.authorId)} farmers={farmers} language={language} onLike={() => toggleLike(post.id)} onSave={() => toggleSaved(post.id)} onShare={() => share(post)} onComment={text => addComment(post.id, text)} onCrop={filters.selectCrop}/>)}</div> : <div className="community-empty"><span>🌱</span><b>{t('community.emptyTitle', { crop: filters.selectedCrops.map(id => cropLabel(id, language, t)).join(', ') })}</b><p>{t('community.emptyCopy')}</p></div>}
        {!loading && filteredPosts.length > postLimit && <button className="community-load-more" onClick={() => setPostLimit(limit => limit + 5)}>{t('community.loadMore')} <ChevronDown size={16}/></button>}
      </section>
      <aside className={`community-connect ${activeTab !== 'connect' ? 'mobile-hidden' : ''}`} aria-label={t('community.connectTitle')} data-read-id="community-suggestions">
        <ConnectPanel farmers={filteredFarmers} connectedFarmers={connectedFarmers} connections={connections} query={query} onQuery={setQuery} onConnect={onConnect} onSeeAll={() => setShowAllFarmers(!showAllFarmers)} showAll={showAllFarmers} totalConnections={totalConnections} filters={filters} language={language} currentUser={communityData.currentUser}/>
      </aside>
    </div>
    {toast && <div className="community-toast" role="status" aria-live="polite"><Check size={16}/>{toast}</div>}
  </section>;
}

function CropFilterBar({ selected, crops, language, onToggle, onClear }) {
  const { t } = useTranslation();
  const allSelected = !selected.length;
  return <div className="community-filter-row"><nav className="community-crop-filter" aria-label={t('community.filterByCrop')}><button className={`community-chip ${allSelected ? 'active' : ''}`} aria-pressed={allSelected} onClick={onClear}>{t('community.all')}</button>{crops.map(crop => <button key={crop.id} className={`community-chip ${selected.includes(crop.id) ? 'active' : ''}`} aria-pressed={selected.includes(crop.id)} onClick={() => onToggle(crop.id)}><span>{crop.icon}</span>{cropLabel(crop.id, language, t)}</button>)}</nav></div>;
}

function PostComposer({ text, onText, selectedCrop, onCrop, image, onImage, onPost, language }) {
  const { t } = useTranslation();
  const chooseImage = event => { const file = event.target.files?.[0]; if (!file) return; if (!['image/jpeg', 'image/png'].includes(file.type)) return; onImage(URL.createObjectURL(file)); };
  return <form className="community-composer" onSubmit={onPost}><div className="composer-top"><Avatar name={communityData.currentUser.name} color="#698760"/><label className="sr-only" htmlFor="community-post-text">{t('community.composer.label')}</label><textarea id="community-post-text" value={text} onChange={event => onText(event.target.value)} placeholder={t('community.composer.placeholder')} rows="2"/></div>{image && <img className="composer-image-preview" src={image} alt={t('community.composer.preview')}/>}<div className="composer-actions"><label className="community-photo-button"><ImagePlus size={17}/><span>{t('community.composer.photo')}</span><input type="file" accept="image/jpeg,image/png" onChange={chooseImage} aria-label={t('community.composer.photo')}/></label><select value={selectedCrop} onChange={event => onCrop(event.target.value)} aria-label={t('community.composer.crop')}><option value="">{t('community.composer.crop')}</option>{communityData.crops.map(crop => <option key={crop.id} value={crop.id}>{cropEmoji[crop.id]} {cropLabel(crop.id, language, t)}</option>)}</select><button className="community-post-button" type="submit" disabled={!text.trim() || !selectedCrop}><Send size={15}/>{t('community.composer.post')}</button></div></form>;
}

function PostCard({ post, author, farmers, language, onLike, onSave, onShare, onComment, onCrop }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [allComments, setAllComments] = useState(false);
  const [comment, setComment] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const comments = post.comments || [];
  const submitComment = event => { event.preventDefault(); if (!comment.trim()) return; onComment(comment.trim()); setComment(''); setShowComments(true); setAllComments(true); };
  return <article className="community-post-card" data-read-id={`community-post-${post.id}`}>
    <header className="community-post-header"><Avatar name={author?.name || t('community.farmer')} color={author?.avatarColor || '#698760'}/><div className="community-author-meta"><b>{author?.name || t('community.farmer')} {author?.verified && <ShieldCheck size={13} aria-label={t('community.verified')}/>}</b><span>{author?.village || 'Khanna'}, {author?.state || 'Punjab'} · {ago(post.createdAt, language)}</span></div><span className={`community-post-type type-${post.type}`}>{t(`community.postType.${post.type}`)}</span></header>
    <div className="community-post-tags">{post.crops.map(crop => <button key={crop} className="community-post-crop" onClick={() => onCrop(crop)}>{cropEmoji[crop] || '🌱'} {cropLabel(crop, language, t)}</button>)}</div>
    {post.image && <div className={`community-post-image ${imageLoaded ? 'loaded' : ''}`}><div className="community-image-placeholder" aria-hidden="true"/>{!imageError ? <img src={post.image} alt={post.caption} loading="lazy" onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)}/> : <div className="community-image-fallback" aria-hidden="true">🌿</div>}</div>}
    <p className={`community-post-caption ${expanded ? 'expanded' : ''}`}>{post.caption}</p>{post.caption.length > 150 && <button className="community-read-more" onClick={() => setExpanded(!expanded)}>{expanded ? t('community.readLess') : t('community.readMore')}</button>}
    <div className="community-post-actions"><button className={`community-action ${post.liked ? 'liked' : ''}`} onClick={onLike} aria-label={t('community.likePost')} aria-pressed={Boolean(post.liked)}><Heart size={18} fill={post.liked ? 'currentColor' : 'none'}/><span>{t('community.like')} · {formatNumber(post.likes, language)}</span></button><button className="community-action" onClick={() => setShowComments(!showComments)} aria-expanded={showComments}><MessageCircle size={18}/><span>{t('community.comment')} · {formatNumber(comments.length, language)}</span></button><button className="community-action" onClick={onShare}><Share2 size={18}/><span>{t('community.share')}</span></button><button className={`community-action save-action ${post.saved ? 'saved' : ''}`} onClick={onSave} aria-label={t('community.savePost')} aria-pressed={Boolean(post.saved)}><Bookmark size={18} fill={post.saved ? 'currentColor' : 'none'}/><span>{t('community.save')}</span></button></div>
    {(comments.length > 0 || showComments) && <CommentList comments={comments} farmers={farmers} language={language} all={allComments} showAll={() => setAllComments(!allComments)} showComments={showComments} comment={comment} setComment={setComment} submitComment={submitComment}/>}
  </article>;
}

function CommentList({ comments, farmers, language, all, showAll, showComments, comment, setComment, submitComment }) {
  const { t } = useTranslation();
  const displayed = all ? comments : comments.slice(0, 2);
  return <div className="community-comments">{displayed.map(item => { const author = item.authorId === communityData.currentUser.id ? communityData.currentUser : farmers.find(farmer => farmer.id === item.authorId); return <p key={item.id}><b>{author?.name || t('community.farmer')}:</b> {item.text}</p>; })}{comments.length > 2 && <button className="community-view-comments" onClick={showAll}>{all ? t('community.hideComments') : t('community.viewComments', { count: comments.length })}</button>}{showComments && <form className="community-comment-form" onSubmit={submitComment}><label className="sr-only" htmlFor={`comment-${comments.length}`}>{t('community.commentPlaceholder')}</label><input id={`comment-${comments.length}`} value={comment} onChange={event => setComment(event.target.value)} placeholder={t('community.commentPlaceholder')}/><button aria-label={t('community.sendComment')}><Send size={16}/></button></form>}</div>;
}

function FarmerCard({ farmer, status, onConnect, language, currentUser }) {
  const { t } = useTranslation();
  const shared = farmer.shared || farmer.crops.filter(crop => currentUser.crops.includes(crop));
  return <article className="community-farmer-card"><div className="farmer-card-top"><Avatar name={farmer.name} color={farmer.avatarColor}/><div className="farmer-card-name"><b>{farmer.name} {farmer.verified && <ShieldCheck size={13}/>}</b><span>{farmer.village}, {farmer.state}</span></div>{shared.length > 0 && <span className="farmer-match-badge">{formatNumber(shared.length, language)} {t('community.cropsInCommon')}</span>}</div><div className="farmer-farm-size">{t('community.farmSize', { size: formatNumber(farmer.farmSizeHa, language) })}</div><div className="farmer-crop-label">{t('community.grows')}</div><div className="farmer-crops">{farmer.crops.map(crop => <span key={crop} className="farmer-crop-chip">{cropEmoji[crop] || '🌱'} {cropLabel(crop, language, t)}</span>)}</div>{shared.length > 0 && <p className="farmer-shared-line"><Leaf size={13}/>{t('community.bothGrow', { crops: shared.map(crop => cropLabel(crop, language, t)).join(', ') })}</p>}<ConnectButton status={status} name={farmer.name} onClick={onConnect}/></article>;
}

function ConnectButton({ status = 'idle', name, onClick }) {
  const { t } = useTranslation();
  if (status?.startsWith('connected')) return <div className="connected-actions"><span><Check size={16}/>{t('community.connected')}</span><button onClick={() => window.dispatchEvent(new CustomEvent('fieldwise-community-message', { detail: { name } }))}><MessageCircle size={15}/>{t('community.message')}</button></div>;
  return <div className="connect-button-row"><button className={`community-connect-button ${status === 'pending' ? 'pending' : ''}`} onClick={onClick} disabled={status === 'pending'}>{status === 'pending' ? <><Check size={16}/>{t('community.pending')}</> : <><UserPlus size={16}/>{t('community.connect')}</>}</button>{status === 'pending' && <button className="community-cancel-request" onClick={onClick}>{t('community.cancel')}</button>}</div>;
}

function ConnectPanel({ farmers, connectedFarmers, connections, query, onQuery, onConnect, onSeeAll, showAll, totalConnections, filters, language, currentUser }) {
  const { t } = useTranslation();
  const count = showAll ? farmers.length : 5;
  return <div className="community-connect-panel"><div className="connect-panel-heading"><div><span className="section-kicker">FIELDWISE {t('network.network')}</span><h2>{t('community.connectTitle')}</h2></div><span className="connected-count"><Check size={14}/>{t('community.connectedCount', { count: totalConnections })}</span></div>
    <label className="community-farmer-search"><Search size={16}/><input value={query} onChange={event => onQuery(event.target.value)} placeholder={t('community.search')}/><span className="sr-only">{t('community.search')}</span></label>
    <label className="match-my-crops"><input type="checkbox" checked={filters.matchMyCrops} onChange={event => filters.setMatchMyCrops(event.target.checked)}/><span>{t('community.matchMyCrops')}</span></label>
    <div className="suggested-farmer-list" aria-live="polite">{farmers.slice(0, count).map(farmer => <FarmerCard key={farmer.id} farmer={farmer} status={connections[farmer.id]} onConnect={() => onConnect(farmer)} language={language} currentUser={currentUser}/>)}{!farmers.length && <div className="connect-empty">{t('community.noFarmers')}</div>}</div>
    {farmers.length > 5 && <button className="community-see-all" onClick={onSeeAll}>{showAll ? t('community.showLess') : t('community.seeAll')} {showAll ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}</button>}
    {connectedFarmers.length > 0 && <section className="your-connections"><h3>{t('community.yourConnections', { count: connectedFarmers.length })}</h3>{connectedFarmers.map(farmer => <div className="connection-row" key={farmer.id}><Avatar name={farmer.name} color={farmer.avatarColor}/><span><b>{farmer.name}</b><small>{farmer.village}, {farmer.state}</small></span><Check size={15}/></div>)}</section>}
  </div>;
}

function Avatar({ name, color }) { return <span className="community-avatar" style={{ '--avatar-color': color || '#718d68' }} aria-label={name}>{initials(name)}</span>; }
function SkeletonPost() { return <article className="community-skeleton" aria-hidden="true"><div className="skeleton-head"><i/><span/><b/></div><div className="skeleton-image"/><div className="skeleton-lines"><i/><i/><i/></div></article>; }
