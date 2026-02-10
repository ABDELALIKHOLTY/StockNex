'use client';
import { useEffect, useRef }     from "react";
import { useRouter } from "next/navigation";

const useTradingViewWidget = (scriptUrl: string, config: Record<string, unknown>, height = 600) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!containerRef.current) return;
        if (containerRef.current.dataset.loaded) return;
        containerRef.current.innerHTML = `<div class="tradingview-widget-container__widget" style="width: 100%; height: ${height}px;"></div>`;

        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.innerHTML = JSON.stringify(config);

        containerRef.current.appendChild(script);
        containerRef.current.dataset.loaded = 'true';

        // Fonction pour créer et positionner l'overlay
        const createOverlay = (container: HTMLElement) => {
            // Supprimer l'overlay existant s'il y en a un
            const existingOverlay = container.querySelector('.tradingview-link-blocker');
            if (existingOverlay) {
                existingOverlay.remove();
            }

            // Créer un overlay qui bloque toute la zone du bas (où se trouvent les liens TradingView)
            const overlay = document.createElement('div');
            overlay.className = 'tradingview-link-blocker';
            overlay.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                height: 50px;
                z-index: 99999;
                pointer-events: auto;
                background: transparent;
                cursor: default;
            `;
            
            // Rediriger vers watchlist quand on clique sur cette zone
            const handleOverlayClick = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                router.push('/watchlist');
                return false;
            };
            
            overlay.addEventListener('click', handleOverlayClick, true);
            overlay.addEventListener('mousedown', handleOverlayClick, true);
            overlay.addEventListener('mouseup', handleOverlayClick, true);
            overlay.addEventListener('contextmenu', handleOverlayClick, true);
            
            // Ajouter l'overlay au conteneur
            container.style.position = 'relative';
            container.appendChild(overlay);
        };

        // Attendre que le widget soit chargé pour intercepter les iframes
        const checkForIframes = setInterval(() => {
            const container = containerRef.current;
            if (!container) return;

            // Trouver toutes les iframes dans le conteneur
            const iframes = container.querySelectorAll('iframe');
            iframes.forEach((iframe: HTMLIFrameElement) => {
                if (!iframe.hasAttribute('data-protected')) {
                    iframe.setAttribute('data-protected', 'true');
                    // Créer l'overlay pour ce conteneur
                    createOverlay(container);
                }
            });
            
            // Vérifier aussi si le conteneur existe mais n'a pas encore d'overlay
            if (iframes.length > 0 && !container.querySelector('.tradingview-link-blocker')) {
                createOverlay(container);
            }
        }, 500);

        // Continuer à vérifier périodiquement (les widgets peuvent se recharger)
        // Ne pas nettoyer cet intervalle, il doit rester actif

        // Fonction pour vérifier si un lien est TradingView
        const isTradingViewLink = (href: string | null): boolean => {
            if (!href) return false;
            return (
                href.includes('tradingview.com') ||
                href.includes('www.tradingview') ||
                href.includes('charts.tradingview') ||
                href.includes('utm_campaign') ||
                href.includes('utm_source') ||
                href.includes('utm_medium')
            );
        };

        // Fonction pour modifier tous les liens TradingView
        const modifyTradingViewLinks = () => {
            const container = containerRef.current;
            if (container) {
                const links = container.querySelectorAll('a[href]');
                links.forEach((link: Element) => {
                    const anchor = link as HTMLAnchorElement;
                    const href = anchor.getAttribute('href');
                    if (isTradingViewLink(href)) {
                        // Remplacer le href par /watchlist
                        anchor.href = '/watchlist';
                        anchor.setAttribute('href', '/watchlist');
                        // Ajouter un gestionnaire de clic supplémentaire
                        anchor.onclick = (e: MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push('/watchlist');
                            return false;
                        };
                    }
                });
            }
        };

        // Fonction pour intercepter les clics sur les liens TradingView
        const handleLinkClick = (e: Event) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a') as HTMLAnchorElement;
            
            if (link) {
                const href = link.getAttribute('href') || link.href;
                
                if (isTradingViewLink(href)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    // Rediriger vers la watchlist
                    router.push('/watchlist');
                    return false;
                }
            }
        };

        // Ajouter le gestionnaire d'événements au conteneur
        const container = containerRef.current;
        
        if (!container) return;
        
        container.addEventListener('click', handleLinkClick, true);

        // Observer pour intercepter les nouveaux liens ajoutés dynamiquement
        const observer = new MutationObserver(() => {
            modifyTradingViewLinks();
            const links = container.querySelectorAll('a[href*="tradingview"], a[href*="utm_campaign"], a[href*="utm_source"]');
            links.forEach(link => {
                link.addEventListener('click', handleLinkClick, true);
            });
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['href']
        });

        // Vérifier et modifier les liens régulièrement (toutes les 500ms)
        const intervalId = setInterval(() => {
            modifyTradingViewLinks();
        }, 500);

        return () => {
            clearInterval(intervalId);
            clearInterval(checkForIframes);
            container.removeEventListener('click', handleLinkClick, true);
            observer.disconnect();
            
            // Nettoyer les overlays
            const overlays = container.querySelectorAll('.tradingview-link-blocker');
            overlays.forEach(overlay => overlay.remove());
            
            // Nettoyer le contenu
            container.innerHTML = '';
            if (container.dataset) {
              delete container.dataset.loaded;
            }
        }
    }, [scriptUrl, config, height, router])

    return containerRef;
}
export default useTradingViewWidget