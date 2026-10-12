// components/common/CommandPalette.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaHome,
  FaGlobe,
  FaEnvelope,
  FaHistory,
  FaUser,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaLink,
  FaComment,
  FaClipboard,
  FaShieldAlt,
  FaHashtag,
  FaTimes,
} from "react-icons/fa";
import { getScanHistory } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useGuest } from "../../context/GuestContext";

export const OPEN_AUTH_EVENT = "secureshield:open-auth";
export const OPEN_PALETTE_EVENT = "secureshield:open-palette";

const CommandPalette = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();
  const { scans: guestScans } = useGuest();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [remoteScans, setRemoteScans] = useState([]);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const run = useCallback(
    (command) => {
      if (!command) return;
      close();
      command.perform();
    },
    [close],
  );

  // Global keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const onKey = (e) => {
      const isK = e.key?.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setOpen((v) => (v ? false : v));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
  }, []);

  // Focus + scroll lock while open
  useEffect(() => {
    if (!open) return undefined;
    const id = setTimeout(() => inputRef.current?.focus(), 40);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(id);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Lazy-load account history when opened
  useEffect(() => {
    if (!open || !isAuthenticated) return;
    let cancelled = false;
    getScanHistory()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.scans || res?.response || [];
        if (!cancelled) setRemoteScans(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated]);

  const go = (path) => navigate(path);

  const commands = useMemo(() => {
    const nav = [
      { label: "Dashboard", hint: "Overview & analytics", icon: FaHome, keywords: "home stats overview", perform: () => go("/") },
      { label: "URL Scanner", hint: "Scan a website link", icon: FaGlobe, keywords: "url link website scan", perform: () => go("/url-scan") },
      { label: "Message Scanner", hint: "Scan an email or SMS", icon: FaEnvelope, keywords: "message email sms text scan", perform: () => go("/message-scan") },
      { label: "History", hint: "Your past scans", icon: FaHistory, keywords: "history past scans records", perform: () => go("/history") },
    ];

    if (isAuthenticated) {
      nav.push({ label: "Profile", hint: "Account settings", icon: FaUser, keywords: "profile account settings", perform: () => go("/profile") });
    }

    const actions = [
      {
        label: "Scan a URL",
        hint: "Go to the URL scanner",
        icon: FaLink,
        keywords: "scan url link",
        perform: () => go("/url-scan"),
      },
      {
        label: "Scan a message",
        hint: "Go to the message scanner",
        icon: FaComment,
        keywords: "scan message email sms",
        perform: () => go("/message-scan"),
      },
      {
        label: `Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`,
        hint: "Toggle appearance",
        icon: currentTheme === "dark" ? FaSun : FaMoon,
        keywords: "theme dark light appearance mode",
        perform: () => toggleTheme(currentTheme === "dark" ? "light" : "dark"),
      },
    ];

    if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
      actions.push({
        label: "Scan URL from clipboard",
        hint: "Paste & scan copied link",
        icon: FaClipboard,
        keywords: "clipboard paste scan url",
        perform: async () => {
          try {
            const text = (await navigator.clipboard.readText())?.trim();
            if (text) navigate("/url-scan", { state: { url: text } });
            else go("/url-scan");
          } catch {
            go("/url-scan");
          }
        },
      });
    }

    if (isAuthenticated) {
      actions.push({
        label: "Log out",
        hint: "End your session",
        icon: FaSignOutAlt,
        keywords: "logout sign out exit",
        perform: () => logout(),
      });
    } else {
      actions.push(
        {
          label: "Sign in",
          hint: "Access your account",
          icon: FaSignInAlt,
          keywords: "login sign in account",
          perform: () => window.dispatchEvent(new CustomEvent(OPEN_AUTH_EVENT, { detail: { mode: "login" } })),
        },
        {
          label: "Create an account",
          hint: "Sign up free",
          icon: FaUserPlus,
          keywords: "register sign up create account",
          perform: () => window.dispatchEvent(new CustomEvent(OPEN_AUTH_EVENT, { detail: { mode: "register" } })),
        },
      );
    }

    const sourceScans = isAuthenticated ? remoteScans : guestScans;
    const recent = (sourceScans || []).slice(0, 25).map((scan) => {
      const reference = scan.reference || scan.id;
      const content = scan.content || scan.url || scan.message || "Scan";
      return {
        label: content,
        hint: `${(scan.type || "url").toUpperCase()} • ${reference || "unknown"}`,
        icon: scan.type === "message" ? FaComment : reference ? FaHashtag : FaShieldAlt,
        keywords: `${content} ${reference || ""} ${scan.type || ""}`,
        perform: () => go("/history"),
      };
    });

    return [
      { section: "Navigation", items: nav },
      { section: "Actions", items: actions },
      ...(recent.length ? [{ section: "Recent Scans", items: recent }] : []),
    ];
  }, [isAuthenticated, currentTheme, toggleTheme, remoteScans, guestScans, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const flat = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = commands.flatMap((group) =>
      group.items.map((item) => ({ ...item, section: group.section })),
    );
    if (!q) return all;
    return all.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.hint || "").toLowerCase().includes(q) ||
        (item.keywords || "").toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(flat.length - 1, 0)));
  }, [flat.length]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(flat.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flat.length) % Math.max(flat.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(flat[activeIndex]);
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  let lastSection = null;

  return (
    <div className="palette-overlay" onClick={close} role="presentation">
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="palette-input-wrap">
          <FaSearch className="palette-search-icon" />
          <input
            ref={inputRef}
            className="palette-input"
            type="text"
            placeholder="Search pages, actions, or scans..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
          />
          <button className="palette-esc" onClick={close} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="palette-list" ref={listRef}>
          {flat.length === 0 ? (
            <div className="palette-empty">No results for “{query}”</div>
          ) : (
            flat.map((item, index) => {
              const Icon = item.icon;
              const showSection = item.section !== lastSection;
              lastSection = item.section;
              return (
                <React.Fragment key={`${item.section}-${item.label}-${index}`}>
                  {showSection && (
                    <div className="palette-group-label">{item.section}</div>
                  )}
                  <button
                    type="button"
                    data-active={index === activeIndex}
                    className={`palette-item${index === activeIndex ? " active" : ""}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => run(item)}
                  >
                    <span className="palette-item-icon">
                      <Icon size={15} />
                    </span>
                    <span className="palette-item-text">
                      <span className="palette-item-label">{item.label}</span>
                      {item.hint && (
                        <span className="palette-item-hint">{item.hint}</span>
                      )}
                    </span>
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>

        <div className="palette-foot">
          <span>
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> navigate
          </span>
          <span>
            <kbd className="kbd">↵</kbd> select
          </span>
          <span>
            <kbd className="kbd">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
