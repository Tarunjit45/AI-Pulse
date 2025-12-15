import { useState, useEffect, useCallback, useRef } from 'react';
import { Article } from '../types';
import { generateSingleArticle } from '../services/geminiService';

export const useNewsFeed = (region: 'Global' | 'India', category: string) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Ref to prevent duplicate fetches for the exact same state
    const isFetchingRef = useRef(false);
    // Ref to track processed IDs/Titles to avoid duplicates in a session
    const seenTitles = useRef<Set<string>>(new Set<string>());

    const fetchNextArticle = useCallback(async (isInitial = false) => {
        if (isFetchingRef.current) return;
        
        // Don't set global loading true for background fetches
        if (isInitial) setIsLoading(true);
        isFetchingRef.current = true;
        
        try {
            // Get current list of titles to avoid
            const currentTitles = Array.from(seenTitles.current) as string[];
            
            const newArticle = await generateSingleArticle(currentTitles, region, category);
            
            // Add to Seen set
            seenTitles.current.add(newArticle.title);

            setArticles(prev => {
                // Double check uniqueness before adding to state
                if (prev.some(a => a.title === newArticle.title)) return prev;
                return [...prev, newArticle];
            });
            
            setError(null);
        } catch (err) {
            console.error("Feed Fetch Error:", err);
            // Only show full error screen if we have NO content
            if (articles.length === 0) {
                setError(err instanceof Error ? err.message : 'Connection interrupted.');
            }
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [region, category, articles.length]);

    // Initial Load Effect
    useEffect(() => {
        // Reset state on filter change
        setArticles([]);
        seenTitles.current.clear();
        setError(null);
        
        const init = async () => {
             // Fetch first article
             await fetchNextArticle(true);
             // Pre-fetch second article immediately in background for smooth start
             fetchNextArticle(false);
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [region, category]);

    // Swipe Handler
    const handleSwipe = useCallback(() => {
        setArticles(prev => {
            const next = prev.slice(1);
            // Smart Buffer: If we drop below 3 articles, fetch more
            if (next.length < 3) {
                // We use setTimeout to push this to the end of the event loop
                // ensuring the UI updates first
                setTimeout(() => fetchNextArticle(false), 100);
            }
            return next;
        });
    }, [fetchNextArticle]);

    // Manual Retry
    const retry = () => fetchNextArticle(true);

    return {
        articles,
        isLoading,
        error,
        handleSwipe,
        retry
    };
};