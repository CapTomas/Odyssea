document.addEventListener('DOMContentLoaded', () => {

    const GEMINI_API_KEY = "AIzaSyA84Kyu7r2tTnaP_u5q9dd-B4NiTnwDkso"; // Replace with your actual key
    const DEFAULT_LANGUAGE = 'en';
    const UPDATE_HIGHLIGHT_DURATION = 5000; // ms

    const PROMPT_URLS = {
        initial: 'prompts/initial.txt',
        default: 'prompts/default.txt',
        combat: 'prompts/combat.txt',
        starts: 'prompts/helpers/starts.txt',
        ship_names_en: 'prompts/helpers/ship_names_en.txt',
        ship_names_cs: 'prompts/helpers/ship_names_cs.txt' 
    };
    let gamePrompts = {
        initial: null,
        default: null,
        combat: null,
        starts: null,
        ship_names_en: null, 
        ship_names_cs: null 
    };
    let currentPromptType = 'initial'; // 'initial', 'default', 'combat'

    // UI Elements
    const gameTitleElement = document.getElementById('game-title');
    const systemStatusIndicator = document.getElementById('system-status-indicator');
    const gmSpecificActivityIndicator = document.getElementById('gm-activity-indicator');
    const languageToggleButton = document.getElementById('language-toggle-button');

    // Player Status
    const infoPlayerCallsign = document.getElementById('info-player-callsign');
    const infoPlayerCredits = document.getElementById('info-player-credits');
    const infoPlayerReputation = document.getElementById('info-player-reputation');
    const infoPlayerAffiliation = document.getElementById('info-player-affiliation');

    // Ship Status
    const infoShipName = document.getElementById('info-ship-name');
    const infoShipType = document.getElementById('info-ship-type');
    const meterShipIntegrity = document.getElementById('meter-ship-integrity');
    const infoShipIntegrity = document.getElementById('info-ship-integrity');
    const meterShipShields = document.getElementById('meter-ship-shields');
    const infoShipShields = document.getElementById('info-ship-shields');
    const meterShipFuel = document.getElementById('meter-ship-fuel');
    const infoShipFuel = document.getElementById('info-ship-fuel');
    const infoShipCargo = document.getElementById('info-ship-cargo');
    const infoShipSpeed = document.getElementById('info-ship-speed');

    // Comms Channel
    const commsChannelConsoleBox = document.getElementById('comms-channel-console-box');
    const infoCommsChannelStatus = document.getElementById('info-comms-channel-status');

    // Mission Intel
    const infoObjective = document.getElementById('info-objective');
    const infoDirectiveReward = document.getElementById('info-directive-reward');
    const infoDirectiveStatus = document.getElementById('info-directive-status');
    const infoAlertLevel = document.getElementById('info-alert-level');

    // Navigation Data
    const infoLocation = document.getElementById('info-location');
    const infoSystemFaction = document.getElementById('info-system-faction');
    const infoEnvironment = document.getElementById('info-environment');
    const infoSensorConditions = document.getElementById('info-sensor-conditions');
    const infoStardate = document.getElementById('info-stardate');

    // Enemy Intel
    const enemyIntelConsoleBox = document.getElementById('enemy-intel-console-box');
    const infoEnemyShipType = document.getElementById('info-enemy-ship-type');
    const meterEnemyShields = document.getElementById('meter-enemy-shields');
    const infoEnemyShieldsStatus = document.getElementById('info-enemy-shields-status');
    const meterEnemyHull = document.getElementById('meter-enemy-hull');
    const infoEnemyHullIntegrity = document.getElementById('info-enemy-hull-integrity');

    // Story & Input
    const storyLog = document.getElementById('story-log');
    const suggestedActionsWrapper = document.getElementById('suggested-actions-wrapper');
    const nameInputSection = document.getElementById('name-input-section');
    const playerCallsignInput = document.getElementById('player-name-input');
    const startGameButton = document.getElementById('start-game-button');
    const actionInputSection = document.getElementById('action-input-section');
    const playerActionInput = document.getElementById('player-action-input');
    const sendActionButton = document.getElementById('send-action-button');

    let gameHistory = [];
    let playerCallsign = '';
    let currentAppLanguage = localStorage.getItem('preferredAppLanguage') || DEFAULT_LANGUAGE;
    let currentNarrativeLanguage = localStorage.getItem('preferredNarrativeLanguage') || DEFAULT_LANGUAGE;
    let isInitialGameLoad = false;

    const uiLangData = {
        en: {
            "toggle_language": "English",
            "aria_label_toggle_language": "Switch to English",
            "system_status_online_short": "Core Systems Online",
            "system_processing_short": "Running Calculations...",
            "title_captain_status": "Captain's Log",
            "label_player_callsign": "Captain's name:",
            "label_player_credits": "Credit Balance:",
            "label_player_reputation": "Galactic Standing:",
            "label_player_affiliation": "Allegiance:",
            "title_ship_status": "Ship Diagnostics",
            "label_ship_name": "Ship Registry:",
            "label_ship_type": "Vessel Class:",
            "label_ship_integrity": "Hull Status:",
            "label_ship_shields": "Shield Strength:",
            "label_ship_fuel": "Fuel Reserves:",
            "label_ship_cargo": "Cargo Hold:",
            "label_ship_speed": "Cruising Velocity:",
            "title_comms_channel": "Comms Channel",
            "label_comms_status": "Channel Status:",
            "title_active_directive": "Current Directive",
            "label_directive_details": "Mission Briefing:",
            "label_directive_reward": "Reward Estimate:",
            "label_directive_status": "Current Status:",
            "label_alert_level": "Alert Status:",
            "title_navigation_data": "Navigation Console",
            "label_current_location": "Coordinates:",
            "label_system_faction": "Sector Authority:",
            "label_environment": "Environment:",
            "label_sensor_conditions": "Sensor Conditions:",
            "label_stardate": "Stardate:",
            "title_enemy_intel": "Enemy Vessel Intel",
            "label_enemy_ship_type": "Enemy Type:",
            "label_enemy_shields": "Enemy Shields:",
            "label_enemy_hull": "Enemy Hull:",
            "placeholder_callsign_login": "Enter your name to access ship systems...",
            "placeholder_command": "Enter command or open channel...",
            "button_access_systems": "Connect",
            "button_execute_command": "Transmit",
            "status_ok": "Operational",
            "status_warning": "Caution",
            "status_danger": "Critical",
            "status_error": "System Fault",
            "unknown": "Unknown",
            "standby": "Core Systems Online",
            "online": "Online",
            "offline": "Offline",
            "none": "None",
            "not_available_short": "N/A",
            "initializing": "Booting Ship Systems...",
            "connecting": "Linking as",
            "active": "Engaged",
            "failed": "Failure",
            "system_lang_set_en": "System: Interface and narrative set to ENGLISH.",
            "system_lang_set_cs": "System: Interface and narrative set to CZECH.",
            "placeholder_enter_callsign": "Input name to initialize systems...",
            "button_engage_systems": "Power Up Systems",
            "alert_level_green": "Green",
            "alert_level_yellow": "Yellow",
            "alert_level_red": "Red",
            "alert_level_info": "Status",
            "activity_exploring": "Exploring",
            "activity_fighting": "Fighting",
            "activity_communicating": "Communicating",
        },
        cs: {
            "toggle_language": "Česky",
            "aria_label_toggle_language": "Přepnout do Češtiny",
            "system_status_online_short": "Základní systémy online",
            "system_processing_short": "Probíhá výpočet...",
            "title_captain_status": "Kapitánský Záznam",
            "label_player_callsign": "Jméno Kapitána:",
            "label_player_credits": "Kreditní Zůstatek:",
            "label_player_reputation": "Pověst ve Vesmíru:",
            "label_player_affiliation": "Příslušnost:",
            "title_ship_status": "Diagnostika Lodi",
            "label_ship_name": "Registrace Lodi:",
            "label_ship_type": "Třída Plavidla:",
            "label_ship_integrity": "Stav Trupu:",
            "label_ship_shields": "Síla Štítů:",
            "label_ship_fuel": "Zásoby Paliva:",
            "label_ship_cargo": "Nákladový Prostor:",
            "label_ship_speed": "Letová Rychlost:",
            "title_comms_channel": "Komunikační Kanál",
            "label_comms_status": "Stav Kanálu:",
            "title_active_directive": "Aktuální Mise",
            "label_directive_details": "Brífink Mise:",
            "label_directive_reward": "Odhadovaná Odměna:",
            "label_directive_status": "Aktuální Stav:",
            "label_alert_level": "Stav Poplachu:",
            "title_navigation_data": "Navigační Konzole",
            "label_current_location": "Souřadnice:",
            "label_system_faction": "Autorita Sektoru:",
            "label_environment": "Prostředí:",
            "label_sensor_conditions": "Stav Senzorů:",
            "label_stardate": "Hvězdné Datum:",
            "title_enemy_intel": "Informace o Nepřátelském Plavidle",
            "label_enemy_ship_type": "Typ Nepřítele:",
            "label_enemy_shields": "Nepřátelské Štíty:",
            "label_enemy_hull": "Nepřátelský Trup:",
            "placeholder_callsign_login": "Zadejte své jméno pro přístup k lodním systémům...",
            "placeholder_command": "Zadejte příkaz nebo otevřete komunikaci...",
            "button_access_systems": "Připojit",
            "button_execute_command": "Odeslat",
            "status_ok": "V Provozun",
            "status_warning": "Pozor",
            "status_danger": "Kritické",
            "status_error": "Systémová Chyba",
            "unknown": "Neznámý",
            "standby": "Základní systémy online",
            "online": "Online",
            "offline": "Offline",
            "none": "Žádný",
            "not_available_short": "N/A",
            "initializing": "Spouštím lodní systémy...",
            "connecting": "Připojuji jako",
            "active": "Aktivní",
            "failed": "Selhalo",
            "system_lang_set_en": "Systém: Rozhraní a vyprávění nastaveno na ANGLIČTINU.",
            "system_lang_set_cs": "Systém: Rozhraní a vyprávění nastaveno na ČEŠTINU.",
            "placeholder_enter_callsign": "Zadejte jméno pro spuštění systémů...",
            "button_engage_systems": "Spustit Systémy",
            "alert_level_green": "Zelená",
            "alert_level_yellow": "Žlutá",
            "alert_level_red": "Červená",
            "alert_level_info": "Stav",
            "activity_exploring": "Průzkum",
            "activity_fighting": "Boj",
            "activity_communicating": "Komunikace",
        }
    };
    const NARRATIVE_LANG_PROMPT_PARTS = {
        en: `This narrative must be written in fluent, immersive English, suitable for a high-quality sci-fi novel. Dialogue should be natural.`,
        cs: `Tento příběh musí být napsán plynulou, poutavou češtinou, vhodnou pro kvalitní sci-fi román. Dialogy by měly být přirozené.`
    };

    async function fetchPrompt(promptName) {
        if (!PROMPT_URLS[promptName]) {
            console.error(`Prompt URL for "${promptName}" not defined.`);
            return `Error: Prompt "${promptName}" not found.`;
        }
        try {
            const response = await fetch(PROMPT_URLS[promptName]);
            if (!response.ok) {
                throw new Error(`Failed to load prompt ${promptName}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error(error);
            addMessageToLog(`SYSTEM ERROR: Could not load critical game prompt: ${promptName}. Please check file paths and network.`, 'system');
            return `Error: Prompt "${promptName}" could not be loaded. ${error.message}`;
        }
    }

    async function loadAllPrompts() {
        const promptNames = Object.keys(PROMPT_URLS);
        const loadingPromises = promptNames.map(name =>
            fetchPrompt(name).then(text => {
                gamePrompts[name] = text;
            })
        );
        try {
            await Promise.all(loadingPromises);
            console.log("All prompts loaded successfully.");
            for (const name of promptNames) {
                if (gamePrompts[name] && gamePrompts[name].startsWith("Error:")) {
                    throw new Error(`Failed to load prompt: ${name}`);
                }
            }
            return true;
        } catch (error) {
            console.error("Failed to load one or more prompts:", error);
            if (systemStatusIndicator) {
                systemStatusIndicator.textContent = (uiLangData[currentAppLanguage]?.status_error || "Error");
                systemStatusIndicator.className = 'status-indicator status-danger';
            }
            if (startGameButton) startGameButton.disabled = true;
            if (playerCallsignInput) playerCallsignInput.disabled = true;
            return false;
        }
    }

    function setAppLanguage(lang) {
        currentAppLanguage = lang;
        localStorage.setItem('preferredAppLanguage', lang);
        if (document.documentElement) {
            document.documentElement.lang = lang;
        }

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (uiLangData[lang] && uiLangData[lang][key]) {
                if ((el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) {
                    if (!el.classList.contains('console-box-title') || el.tagName.toLowerCase() === 'h3') {
                        el.textContent = uiLangData[lang][key];
                    }
                }
            }
        });
        document.querySelectorAll('.console-box-title[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (uiLangData[lang] && uiLangData[lang][key]) {
                el.textContent = uiLangData[lang][key];
            }
        });


        document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-key-placeholder');
            if (uiLangData[lang] && uiLangData[lang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = uiLangData[lang][key];
                }
            }
        });

        document.querySelectorAll('[data-lang-key-aria]').forEach(el => {
            const key = el.getAttribute('data-lang-key-aria');
            if (uiLangData[lang] && uiLangData[lang][key]) {
                el.setAttribute('aria-label', uiLangData[lang][key]);
            }
        });

        if (languageToggleButton) {
            const otherLang = lang === 'en' ? 'cs' : 'en';
            languageToggleButton.textContent = uiLangData[otherLang]?.toggle_language || (otherLang === 'cs' ? 'Česky' : 'English');
            const ariaKeyForToggleAction = `aria_label_toggle_language`;
            const ariaLabelText = uiLangData[otherLang]?.[ariaKeyForToggleAction] || `Switch to ${otherLang === 'cs' ? 'Czech' : 'English'}`;
            languageToggleButton.setAttribute('aria-label', ariaLabelText);
        }
        initializeDashboardDefaultTexts();
    }

    function toggleAppLanguage() {
        const newLang = currentAppLanguage === 'en' ? 'cs' : 'en';
        setAppLanguage(newLang);
        currentNarrativeLanguage = newLang;
        localStorage.setItem('preferredNarrativeLanguage', newLang);

        const systemMessageKey = newLang === 'en' ? "system_lang_set_en" : "system_lang_set_cs";
        let systemMessage = uiLangData[newLang]?.[systemMessageKey] || `System: UI & Narrative language set to ${newLang.toUpperCase()}.`;
        addMessageToLog(systemMessage, 'system');
    }

    const getSystemPrompt = (currentCallsignForPrompt, promptTypeToUse) => {
        const narrativeLanguageInstruction = NARRATIVE_LANG_PROMPT_PARTS[currentNarrativeLanguage] || NARRATIVE_LANG_PROMPT_PARTS[DEFAULT_LANGUAGE];
        let basePromptText = gamePrompts[promptTypeToUse] || gamePrompts.default;
    
        if (!basePromptText || basePromptText.startsWith("Error:")) {
            console.error(`Error: Prompt text for type "${promptTypeToUse}" is invalid or not loaded.`);
            return `{"narrative": "SYSTEM ERROR: Critical prompt data missing. Cannot proceed.", "dashboard_updates": {}, "suggested_actions": ["Contact support."], "game_state_indicators": {"activity_status": "Error", "combat_engaged": false, "comms_channel_active": false}}`;
        }
    
        // --- NEW LOGIC FOR INJECTING START IDEAS ---
        if (promptTypeToUse === 'initial') {
            // --- Inject Start Ideas (as before) ---
            if (gamePrompts.starts) {
                const allStartIdeas = gamePrompts.starts.split('\n').map(idea => idea.trim()).filter(idea => idea.length > 0);
                let selectedIdeas = [];
                if (allStartIdeas.length > 0) {
                    const shuffledIdeas = [...allStartIdeas].sort(() => 0.5 - Math.random());
                    selectedIdeas = shuffledIdeas.slice(0, 3);
                }
                basePromptText = basePromptText.replace(/\$\{startIdea1\}/g, selectedIdeas[0] || "GM Custom Scenario Idea 1");
                basePromptText = basePromptText.replace(/\$\{startIdea2\}/g, selectedIdeas[1] || "GM Custom Scenario Idea 2");
                basePromptText = basePromptText.replace(/\$\{startIdea3\}/g, selectedIdeas[2] || "GM Custom Scenario Idea 3");
            }
    
            // --- NEW LOGIC FOR INJECTING SHIP NAME IDEAS ---
            let shipNameIdeasFileContent = null;
            if (currentNarrativeLanguage === 'cs' && gamePrompts.ship_names_cs) {
                shipNameIdeasFileContent = gamePrompts.ship_names_cs;
            } else if (gamePrompts.ship_names_en) { // Default to English if CS not found or lang is EN
                shipNameIdeasFileContent = gamePrompts.ship_names_en;
            }
    
            if (shipNameIdeasFileContent) {
                const allShipNameIdeas = shipNameIdeasFileContent.split('\n').map(name => name.trim()).filter(name => name.length > 0);
                let selectedShipNames = [];
                if (allShipNameIdeas.length > 0) {
                    const shuffledNames = [...allShipNameIdeas].sort(() => 0.5 - Math.random());
                    selectedShipNames = shuffledNames.slice(0, 3);
                }
                basePromptText = basePromptText.replace(/\$\{suggestedShipName1\}/g, selectedShipNames[0] || `InventedNameAlpha`); // Fallback
                basePromptText = basePromptText.replace(/\$\{suggestedShipName2\}/g, selectedShipNames[1] || `InventedNameBeta`);  // Fallback
                basePromptText = basePromptText.replace(/\$\{suggestedShipName3\}/g, selectedShipNames[2] || `InventedNameGamma`); // Fallback
            } else {
                // Fallback if no ship name files are loaded
                basePromptText = basePromptText.replace(/\$\{suggestedShipName1\}/g, `DefaultName1`);
                basePromptText = basePromptText.replace(/\$\{suggestedShipName2\}/g, `DefaultName2`);
                basePromptText = basePromptText.replace(/\$\{suggestedShipName3\}/g, `DefaultName3`);
            }
            // --- END OF NEW SHIP NAME LOGIC ---
        }
    
        // Replace other placeholders (as before)
        basePromptText = basePromptText.replace(/\$\{narrativeLanguageInstruction\}/g, narrativeLanguageInstruction);
        basePromptText = basePromptText.replace(/\$\{currentCallsignForPrompt\}/g, currentCallsignForPrompt || 'UNKNOWN_CAPTAIN');
        basePromptText = basePromptText.replace(/\$\{currentNarrativeLanguage\.toUpperCase\(\)\}/g, currentNarrativeLanguage.toUpperCase());
        // Add this line if it's not already there for the example in shipName field
        basePromptText = basePromptText.replace(/\$\{currentNarrativeLanguage\.toUpperCase\(\) === 'EN' \? "'Online' or 'Offline'" : "'Připojeno' or 'Odpojeno'"\}/g, currentNarrativeLanguage.toUpperCase() === 'EN' ? "'Online' or 'Offline'" : "'Připojeno' or 'Odpojeno'");
    
    
        return basePromptText;
    };

    function highlightElementUpdate(element) {
        if (!element) return;
        const target = element.closest('.info-item, .info-item-meter');
        if (target) {
            target.classList.add('value-updated');
            setTimeout(() => {
                target.classList.remove('value-updated');
            }, UPDATE_HIGHLIGHT_DURATION);
        } else if (element.classList.contains('value') || element.classList.contains('value-overlay')) {
            element.classList.add('value-updated');
            setTimeout(() => {
                element.classList.remove('value-updated');
            }, UPDATE_HIGHLIGHT_DURATION);
        }
    }

    function addMessageToLog(text, sender) {
        if (!storyLog) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        text = text.replace(/_([^_]+)_|\*([^*]+)\*/g, (match, p1, p2) => `<em>${p1 || p2}</em>`);

        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '');
        if (paragraphs.length === 0 && text.trim() !== '') {
            paragraphs.push(text.trim());
        }

        paragraphs.forEach(paraText => {
            const p = document.createElement('p');
            p.innerHTML = paraText.replace(/\n/g, '<br>');
            messageDiv.appendChild(p);
        });

        storyLog.appendChild(messageDiv);
        if (storyLog.parentElement) {
            storyLog.parentElement.scrollTop = storyLog.parentElement.scrollHeight;
        }
    }

    function setGMActivity(isProcessing) {
        if (gmSpecificActivityIndicator) gmSpecificActivityIndicator.style.display = isProcessing ? 'inline-flex' : 'none';
        if (systemStatusIndicator) systemStatusIndicator.style.display = isProcessing ? 'none' : 'inline-flex';

        if (playerActionInput) playerActionInput.disabled = isProcessing;
        if (sendActionButton) sendActionButton.disabled = isProcessing;
        document.querySelectorAll('#suggested-actions-wrapper .ui-button').forEach(btn => btn.disabled = isProcessing);

        if (!isProcessing && actionInputSection && actionInputSection.style.display !== 'none' && playerActionInput) {
            playerActionInput.focus();
        }
    }

    const setMeter = (barEl, textEl, newPercentageStr, meterType, options = {}) => {
        const { highlight = true, newStatusText, initialPlaceholder } = options;

        if (!textEl && !barEl) return;

        let finalPct = -1;
        let finalStatusTextPart = null;

        if (newPercentageStr !== undefined && newPercentageStr !== null) {
            let parsedPct = parseInt(newPercentageStr, 10);
            if (!isNaN(parsedPct)) {
                finalPct = Math.max(0, Math.min(100, parsedPct));
            } else {
                const naShortText = uiLangData[currentAppLanguage]?.not_available_short || 'N/A';
                if (textEl && (newPercentageStr === "---" || newPercentageStr === naShortText)) {
                    if (textEl.textContent !== newPercentageStr) {
                        textEl.textContent = newPercentageStr;
                        if (highlight) highlightElementUpdate(textEl);
                    }
                    if (barEl && barEl.style.width !== '0%') {
                        barEl.style.width = '0%';
                        if (highlight) highlightElementUpdate(textEl || barEl.parentElement);
                    }
                    return;
                }
                if (meterType === 'shields' || meterType === 'enemy_shields') {
                    finalPct = 0;
                } else if (textEl) {
                    const currentContent = textEl.textContent;
                    const pctMatch = currentContent.match(/(\d+)%/);
                    if (pctMatch) finalPct = parseInt(pctMatch[1], 10);
                    else finalPct = (meterType === 'integrity' || meterType === 'fuel') ? 100 : 0;
                } else {
                    finalPct = (meterType === 'integrity' || meterType === 'fuel') ? 100 : 0;
                }
            }
        } else {
            if (textEl) {
                const currentContent = textEl.textContent;
                const pctMatch = currentContent.match(/(\d+)%/);
                if (pctMatch) {
                    finalPct = parseInt(pctMatch[1], 10);
                } else if (currentContent === (uiLangData[currentAppLanguage]?.not_available_short || 'N/A') || currentContent === "---") {
                    finalPct = 0;
                }
            }
            if (finalPct === -1) {
                const placeholderPctMatch = initialPlaceholder ? initialPlaceholder.match(/(\d+)%/) : null;
                if (placeholderPctMatch) {
                    finalPct = parseInt(placeholderPctMatch[1], 10);
                } else {
                    finalPct = (meterType === 'shields' || meterType === 'enemy_shields') ? 0 : 100;
                }
            }
        }

        if (meterType === 'shields' || meterType === 'enemy_shields') {
            if (newStatusText !== undefined && newStatusText !== null) {
                finalStatusTextPart = newStatusText;
            } else {
                let currentStatusFromDOM = null;
                if (textEl) {
                    const currentContent = textEl.textContent;
                    const statusMatch = currentContent.match(/^(.*?):\s*\d+%/);
                    if (statusMatch) {
                        currentStatusFromDOM = statusMatch[1].trim();
                    }
                }

                if (currentStatusFromDOM) {
                    finalStatusTextPart = currentStatusFromDOM;
                } else {
                    finalStatusTextPart = finalPct > 0 ? (uiLangData[currentAppLanguage]?.online || 'Online') : (uiLangData[currentAppLanguage]?.offline || 'Offline');
                }

                const offlineText = uiLangData[currentAppLanguage]?.offline || 'Offline';
                const onlineText = uiLangData[currentAppLanguage]?.online || 'Online';
                if (finalPct === 0 && finalStatusTextPart !== offlineText) {
                    finalStatusTextPart = offlineText;
                } else if (finalPct > 0 && finalStatusTextPart === offlineText) {
                     // Only switch from "Offline" to "Online" if percentage is now positive.
                    // This avoids overriding specific statuses like "Fluctuating" if they were already set.
                    if (textEl && textEl.textContent.toLowerCase().startsWith(offlineText.toLowerCase())) {
                        finalStatusTextPart = onlineText;
                    }
                }
            }
        }

        let newTextContent = '';
        let newBarColor = '';

        if (meterType === 'shields' || meterType === 'enemy_shields') {
            finalStatusTextPart = finalStatusTextPart || (finalPct > 0 ? (uiLangData[currentAppLanguage]?.online || 'Online') : (uiLangData[currentAppLanguage]?.offline || 'Offline'));
            newTextContent = `${finalStatusTextPart}: ${finalPct}%`;

            newBarColor = 'var(--color-status-info-bar)';
            const statusTextLower = finalStatusTextPart.toLowerCase();
            const offlineTextLower = (uiLangData[currentAppLanguage]?.offline || 'offline').toLowerCase();

            if (statusTextLower === offlineTextLower || finalPct === 0) {
                newBarColor = 'var(--color-status-offline-bar)';
            } else if (finalPct < 25) {
                newBarColor = 'var(--color-status-danger-bar)';
            } else if (finalPct < 60) {
                newBarColor = 'var(--color-status-warning-bar)';
            }
        } else if (meterType === 'integrity' || meterType === 'enemy_hull') {
            newTextContent = `${finalPct}%`;
            newBarColor = 'var(--color-status-integrity-ok-bar)';
            if (finalPct < 25) newBarColor = 'var(--color-status-danger-bar)';
            else if (finalPct < 60) newBarColor = 'var(--color-status-warning-bar)';
        } else if (meterType === 'fuel') {
            newTextContent = `${finalPct}%`;
            newBarColor = 'var(--color-status-fuel-ok-bar)';
            if (finalPct < 20) newBarColor = 'var(--color-status-danger-bar)';
            else if (finalPct < 50) newBarColor = 'var(--color-status-fuel-warning-bar)';
        }

        let textChanged = false;
        let barStyleChanged = false;

        if (textEl && textEl.textContent !== newTextContent) {
            textEl.textContent = newTextContent;
            textChanged = true;
        }
        if (barEl) {
            if (barEl.style.width !== `${finalPct}%`) {
                barEl.style.width = `${finalPct}%`;
                barStyleChanged = true;
            }
            if (barEl.style.backgroundColor !== newBarColor) {
                barEl.style.backgroundColor = newBarColor;
                barStyleChanged = true;
            }
        }

        if (highlight && (textChanged || barStyleChanged)) {
            highlightElementUpdate(textEl || (barEl ? barEl.parentElement : null));
        }
    };

    function updateDashboard(updates) {
        if (!updates) return;
        const unknown = uiLangData[currentAppLanguage]?.unknown || '---';
        const naShort = uiLangData[currentAppLanguage]?.not_available_short || 'N/A';

        const setText = (el, value, options = {}) => {
            const {
                suffix = '', defaultValue = unknown, highlight = true, initialPlaceholder = unknown
            } = options;
            if (el) {
                const currentVal = el.textContent;
                if (value !== undefined && value !== null) {
                    const newVal = `${value}${suffix}`;
                    if (currentVal !== newVal) {
                        el.textContent = newVal;
                        if (highlight) highlightElementUpdate(el);
                    }
                } else if (currentVal === '' || currentVal === initialPlaceholder || currentVal === defaultValue) {
                    // el.textContent = defaultValue; // Only set if it's truly an initial setup or explicit reset
                }
            }
        };

        // Player
        setText(infoPlayerCallsign, updates.callsign, {
            initialPlaceholder: unknown
        });
        setText(infoPlayerCredits, updates.credits, {
            suffix: (updates.credits && typeof updates.credits === 'string' && !/[a-zA-Z]/.test(updates.credits.trim()) && !updates.credits.toLowerCase().includes('uec')) ? ' UEC' : '',
            initialPlaceholder: `${unknown} UEC`
        });
        setText(infoPlayerReputation, updates.reputation, {
            initialPlaceholder: unknown
        });
        setText(infoPlayerAffiliation, updates.affiliation, {
            initialPlaceholder: unknown
        });

        // Player Ship
        setText(infoShipName, updates.shipName, {
            initialPlaceholder: unknown
        });
        setText(infoShipType, updates.shipType, {
            initialPlaceholder: unknown
        });
        setMeter(meterShipIntegrity, infoShipIntegrity, updates.integrityPct, 'integrity', {
            initialPlaceholder: '100%'
        });
        setMeter(meterShipShields, infoShipShields, updates.shieldsPct, 'shields', {
            newStatusText: updates.shieldsStatus,
            initialPlaceholder: `${uiLangData[currentAppLanguage]?.online || 'Online'}: 100%`
        });
        setMeter(meterShipFuel, infoShipFuel, updates.fuelPct, 'fuel', {
            initialPlaceholder: '100%'
        });
        setText(infoShipCargo, updates.cargo, {
            initialPlaceholder: `${naShort}/${naShort} SCU`
        });
        setText(infoShipSpeed, updates.currentShipSpeed, {
            suffix: (updates.currentShipSpeed && typeof updates.currentShipSpeed === 'string' && !/[a-zA-Z]/.test(updates.currentShipSpeed.trim()) && !updates.currentShipSpeed.includes('m/s') && !updates.currentShipSpeed.includes('km/s')) ? ' m/s' : '',
            initialPlaceholder: `0 m/s`
        });

        // Comms
        setText(infoCommsChannelStatus, updates.comms_channel_info, {
            initialPlaceholder: unknown
        });

        // Mission
        setText(infoObjective, updates.objective, {
            initialPlaceholder: unknown
        });
        setText(infoDirectiveReward, updates.directiveReward, {
            initialPlaceholder: unknown
        });
        setText(infoDirectiveStatus, updates.directive_status, {
            initialPlaceholder: unknown
        });

        // Alert Level
        if (infoAlertLevel) {
            const currentAlertTextContent = infoAlertLevel.textContent;
            const currentAlertClasses = infoAlertLevel.className;
            if (updates.alertLevel !== undefined) {
                const newAlertDescriptionFromAI = updates.alertLevel;
                let alertSeverity = 'info';
                let alertDisplayKey = 'alert_level_info';
                const lowerVal = String(newAlertDescriptionFromAI).trim().toLowerCase();

                if (lowerVal.includes('red') || lowerVal.includes('critical') || lowerVal.includes('danger') || lowerVal.includes('nebezpečí') || lowerVal.includes('severe') || lowerVal.includes('high') || lowerVal.includes('maximum') || lowerVal.includes('kritické')) {
                    alertSeverity = 'danger';
                    alertDisplayKey = 'alert_level_red';
                } else if (lowerVal.includes('yellow') || lowerVal.includes('minor') || lowerVal.includes('varování') || lowerVal.includes('caution') || lowerVal.includes('medium') || lowerVal.includes('moderate') || lowerVal.includes('žlutá') || lowerVal.includes('pozor')) {
                    alertSeverity = 'warning';
                    alertDisplayKey = 'alert_level_yellow';
                } else if (lowerVal.includes('green') || lowerVal.includes('nominal') || lowerVal.includes('blue') || lowerVal.includes('v pořádku') || lowerVal.includes('operational') || lowerVal.includes('clear') || lowerVal.includes('low') || lowerVal.includes('standby') || lowerVal.includes('zelená') || lowerVal.includes('bezpečný') || lowerVal.includes('normální')) {
                    alertSeverity = 'ok';
                    alertDisplayKey = 'alert_level_green';
                }

                const localizedAlertText = uiLangData[currentAppLanguage]?.[alertDisplayKey] || newAlertDescriptionFromAI;
                infoAlertLevel.textContent = localizedAlertText;
                infoAlertLevel.className = 'value status-' + alertSeverity;

                if (currentAlertTextContent !== localizedAlertText || currentAlertClasses !== infoAlertLevel.className) {
                    highlightElementUpdate(infoAlertLevel);
                }
            } else if (currentAlertTextContent === '' || currentAlertTextContent === unknown) {
                const initialAlertKey = 'alert_level_green';
                infoAlertLevel.textContent = uiLangData[currentAppLanguage]?.[initialAlertKey] || 'Green';
                infoAlertLevel.className = 'value status-ok';
            }
        }

        // Navigation
        setText(infoLocation, updates.location, {
            initialPlaceholder: unknown
        });
        setText(infoSystemFaction, updates.systemFaction, {
            initialPlaceholder: unknown
        });
        setText(infoEnvironment, updates.environment, {
            initialPlaceholder: unknown
        });
        setText(infoSensorConditions, updates.sensorConditions, {
            initialPlaceholder: unknown
        });
        setText(infoStardate, updates.stardate, {
            initialPlaceholder: unknown
        });

        // Enemy Intel
        setText(infoEnemyShipType, updates.enemy_ship_type, {
            initialPlaceholder: unknown,
            highlight: enemyIntelConsoleBox.style.display !== 'none'
        });
        setMeter(meterEnemyShields, infoEnemyShieldsStatus, updates.enemy_shields_pct, 'enemy_shields', {
            newStatusText: updates.enemy_shields_status_text,
            highlight: enemyIntelConsoleBox.style.display !== 'none',
            initialPlaceholder: `${uiLangData[currentAppLanguage]?.offline || 'Offline'}: 0%`
        });
        setMeter(meterEnemyHull, infoEnemyHullIntegrity, updates.enemy_hull_pct, 'enemy_hull', {
            highlight: enemyIntelConsoleBox.style.display !== 'none',
            initialPlaceholder: '100%'
        });
    }


    function displaySuggestedActions(actions) {
        if (!suggestedActionsWrapper) return;
        suggestedActionsWrapper.innerHTML = '';
        if (actions && Array.isArray(actions) && actions.length > 0) {
            actions.slice(0, 3).forEach(actionText => {
                if (typeof actionText === 'string' && actionText.trim() !== '') {
                    const button = document.createElement('button');
                    button.classList.add('ui-button');
                    button.textContent = actionText;
                    button.addEventListener('click', () => {
                        if (playerActionInput) {
                            playerActionInput.value = actionText;
                            playerActionInput.focus();
                            playerActionInput.dispatchEvent(new Event('input', {
                                bubbles: true
                            }));
                        }
                    });
                    suggestedActionsWrapper.appendChild(button);
                }
            });
        }
    }

    function clearSuggestedActions() {
        if (suggestedActionsWrapper) suggestedActionsWrapper.innerHTML = '';
    }

    function handleGameStateIndicators(indicators, isDuringInitialBoot = false) {
        if (!indicators) return;
        const CONDITIONAL_CONSOLE_BOOT_DELAY = 3000;


        const shouldShowEnemyIntel = indicators.combat_engaged === true;
        if (enemyIntelConsoleBox) {
            const isCurrentlyVisible = enemyIntelConsoleBox.style.display !== 'none';
            if (shouldShowEnemyIntel) {
                if (!isCurrentlyVisible) {
                    if (isDuringInitialBoot) {
                        setTimeout(() => {
                            animateConsoleBox(enemyIntelConsoleBox.id, true);
                        }, CONDITIONAL_CONSOLE_BOOT_DELAY);
                    } else {
                        animateConsoleBox(enemyIntelConsoleBox.id, true);
                    }
                }
            } else {
                if (isCurrentlyVisible) {
                    animateConsoleBox(enemyIntelConsoleBox.id, false);
                    const content = enemyIntelConsoleBox.querySelector('.console-box-content');
                    const hideEnemyIntel = () => {
                        if (!enemyIntelConsoleBox.classList.contains('is-expanded') && enemyIntelConsoleBox.style.display !== 'none') {
                            enemyIntelConsoleBox.style.display = 'none';
                        }
                        if (content) content.removeEventListener('transitionend', hideEnemyIntelConditional);
                    };
                    const hideEnemyIntelConditional = (event) => {
                        if (event.target === content && event.propertyName === 'max-height') {
                            hideEnemyIntel();
                        }
                    };

                    if (content) {
                        content.addEventListener('transitionend', hideEnemyIntelConditional, {
                            once: true
                        });
                        setTimeout(hideEnemyIntel, 1600);
                    } else {
                        setTimeout(hideEnemyIntel, 1600);
                    }
                }
            }
        }

        const shouldShowCommsChannel = indicators.comms_channel_active === true;
        if (commsChannelConsoleBox) {
            const isCurrentlyVisible = commsChannelConsoleBox.style.display !== 'none';
            if (shouldShowCommsChannel) {
                if (!isCurrentlyVisible) {
                    if (isDuringInitialBoot) {
                        setTimeout(() => {
                            animateConsoleBox(commsChannelConsoleBox.id, true);
                        }, CONDITIONAL_CONSOLE_BOOT_DELAY);
                    } else {
                        animateConsoleBox(commsChannelConsoleBox.id, true);
                    }
                }
            } else {
                if (isCurrentlyVisible) {
                    animateConsoleBox(commsChannelConsoleBox.id, false);

                    const content = commsChannelConsoleBox.querySelector('.console-box-content');
                    const hideComms = () => {
                        if (!commsChannelConsoleBox.classList.contains('is-expanded') && commsChannelConsoleBox.style.display !== 'none') {
                            commsChannelConsoleBox.style.display = 'none';
                        }
                        if (content) content.removeEventListener('transitionend', hideCommsConditional);
                    };
                    const hideCommsConditional = (event) => {
                        if (event.target === content && event.propertyName === 'max-height') {
                            hideComms();
                        }
                    };

                    if (content) {
                        content.addEventListener('transitionend', hideCommsConditional, {
                            once: true
                        });
                        setTimeout(hideComms, 1600);
                    } else {
                        setTimeout(hideComms, 1600);
                    }
                }
            }
        }

        if (indicators.combat_engaged === true) {
            currentPromptType = 'combat';
        } else {
            if (currentPromptType !== 'default') {
                currentPromptType = 'default';
            }
        }
    }


    async function callGeminiAPI(currentTurnHistory) {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
            addMessageToLog("CRITICAL ERROR: API Key not configured. Please replace placeholder in script.js.", 'system');
            const errorText = (uiLangData[currentAppLanguage]?.status_error || "Error");
            if (systemStatusIndicator) {
                systemStatusIndicator.textContent = errorText;
                systemStatusIndicator.className = 'status-indicator status-danger';
            }
            return null;
        }

        setGMActivity(true);
        clearSuggestedActions();

        const activePromptType = currentTurnHistory.length === 1 && currentTurnHistory[0].role === 'user' && currentTurnHistory[0].parts[0].text.startsWith("My callsign is") ? 'initial' : currentPromptType;
        const systemPromptText = getSystemPrompt(playerCallsign, activePromptType);

        if (systemPromptText.startsWith("Error:")) {
            addMessageToLog(systemPromptText, 'system');
            setGMActivity(false);
            return null;
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

        let payload = {
            contents: currentTurnHistory,
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 8000,
                responseMimeType: "application/json",
            },
            safetySettings: [{
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
            ],
            systemInstruction: {
                parts: [{
                    text: systemPromptText
                }]
            }
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });
            const responseData = await response.json();

            if (!response.ok) {
                console.error("API Error Response:", responseData);
                let errDetail = responseData.error?.message || `API Error ${response.status}`;
                if (responseData.error?.details) {
                    errDetail += ` Details: ${JSON.stringify(responseData.error.details)}`;
                }
                throw new Error(errDetail);
            }

            if (responseData.candidates && responseData.candidates[0]?.content?.parts?.[0]?.text) {
                let jsonStr = responseData.candidates[0].content.parts[0].text;
                try {
                    const parsed = JSON.parse(jsonStr);
                    if (typeof parsed.narrative !== 'string' ||
                        typeof parsed.dashboard_updates !== 'object' ||
                        !Array.isArray(parsed.suggested_actions) ||
                        typeof parsed.game_state_indicators !== 'object') {
                        console.error("Parsed JSON structure is invalid:", parsed);
                        throw new Error("Invalid JSON structure from AI. Missing core fields or game_state_indicators.");
                    }
                    gameHistory.push({
                        role: "model",
                        parts: [{
                            text: JSON.stringify(parsed)
                        }]
                    });

                    updateDashboard(parsed.dashboard_updates);
                    displaySuggestedActions(parsed.suggested_actions);
                    handleGameStateIndicators(parsed.game_state_indicators, isInitialGameLoad);
                    if (isInitialGameLoad) {
                        isInitialGameLoad = false;
                    }


                    const onlineText = (uiLangData[currentAppLanguage]?.system_status_online_short || "System Online");
                    if (systemStatusIndicator) {
                        systemStatusIndicator.textContent = onlineText;
                        systemStatusIndicator.className = 'status-indicator status-ok';
                    }
                    return parsed.narrative;
                } catch (e) {
                    console.error("JSON Parsing Error:", e, "Received String:", jsonStr);
                    throw new Error(`Invalid JSON from AI: ${e.message}. Ensure AI response is valid JSON.`);
                }
            } else if (responseData.promptFeedback?.blockReason) {
                console.error("Content Blocked by API:", responseData.promptFeedback);
                const blockDetails = responseData.promptFeedback.safetyRatings?.map(r => r.category + ': ' + r.probability).join(', ') || "No specific details.";
                throw new Error(`Content blocked by API: ${responseData.promptFeedback.blockReason}. Ratings: ${blockDetails}`);
            } else {
                console.error("No valid candidate or text in API response:", responseData);
                throw new Error("No valid candidate or text part in AI response.");
            }
        } catch (error) {
            console.error('callGeminiAPI Error:', error);
            addMessageToLog(`SYSTEM ERROR: ${error.message}`, 'system');
            const errorText = (uiLangData[currentAppLanguage]?.status_error || "Error");
            if (systemStatusIndicator) {
                systemStatusIndicator.textContent = errorText;
                systemStatusIndicator.className = 'status-indicator status-danger';
            }
            return null;
        } finally {
            setGMActivity(false);
        }
    }

    async function startGame() {
        playerCallsign = playerCallsignInput ? playerCallsignInput.value.trim() : "";
        if (!playerCallsign) {
            alert(uiLangData[currentAppLanguage]?.placeholder_enter_callsign || "Please enter your callsign.");
            if (playerCallsignInput) playerCallsignInput.focus();
            return;
        }
        isInitialGameLoad = true;

        if (nameInputSection) nameInputSection.style.display = 'none';
        if (actionInputSection) actionInputSection.style.display = 'flex';
        if (playerActionInput) {
            playerActionInput.value = '';
            playerActionInput.dispatchEvent(new Event('input', {
                bubbles: true
            }));
            autoGrowTextarea(playerActionInput);
        }
        updateDashboard({
            callsign: playerCallsign
        });
        addMessageToLog(`${uiLangData[currentAppLanguage]?.connecting || 'Connecting as'}: ${playerCallsign}...`, 'system');

        currentPromptType = 'initial';
        gameHistory = [{
            role: "user",
            parts: [{
                text: `My callsign is ${playerCallsign}. I am ready to start the game.`
            }]
        }];
        clearSuggestedActions();

        const narrative = await callGeminiAPI(gameHistory);
        if (narrative) {
            addMessageToLog(narrative, 'gm');
            triggerCockpitBootAnimation();
        } else {
            if (nameInputSection) nameInputSection.style.display = 'flex';
            if (actionInputSection) actionInputSection.style.display = 'none';
            addMessageToLog("Failed to initialize session. Please check console and try again.", 'system');
            isInitialGameLoad = false;
        }
    }

    async function sendPlayerAction() {
        const action = playerActionInput ? playerActionInput.value.trim() : "";
        if (!action) {
            if (playerActionInput) playerActionInput.focus();
            return;
        }
        addMessageToLog(action, 'player');
        if (playerActionInput) {
            playerActionInput.value = '';
            playerActionInput.dispatchEvent(new Event('input', {
                bubbles: true
            }));
            autoGrowTextarea(playerActionInput);
        }
        clearSuggestedActions();

        gameHistory.push({
            role: "user",
            parts: [{
                text: action
            }]
        });
        const narrative = await callGeminiAPI(gameHistory);
        if (narrative) {
            addMessageToLog(narrative, 'gm');
        }
    }

    function initializeDashboardDefaultTexts() {
        const unknown = uiLangData[currentAppLanguage]?.unknown || '---';
        const na = '--';
        const onlineText = uiLangData[currentAppLanguage]?.online || 'Online';
        const offlineText = uiLangData[currentAppLanguage]?.offline || 'Offline';

        if (infoPlayerCallsign) infoPlayerCallsign.textContent = playerCallsign || unknown;
        if (infoPlayerCredits) infoPlayerCredits.textContent = `${unknown} UEC`;
        if (infoPlayerReputation) infoPlayerReputation.textContent = unknown;
        if (infoPlayerAffiliation) infoPlayerAffiliation.textContent = unknown;

        if (infoShipName) infoShipName.textContent = unknown;
        if (infoShipType) infoShipType.textContent = unknown;

        // Use setMeter for consistent initialization and placeholder handling
        setMeter(meterShipIntegrity, infoShipIntegrity, '0', 'integrity', { initialPlaceholder: '0%' });
        setMeter(meterShipShields, infoShipShields, '0', 'shields', { newStatusText: onlineText, initialPlaceholder: `${onlineText}: 0%` });
        setMeter(meterShipFuel, infoShipFuel, '0', 'fuel', { initialPlaceholder: '0%' });
        
        if (infoShipCargo) infoShipCargo.textContent = `${na}/${na} SCU`;
        if (infoShipSpeed) infoShipSpeed.textContent = `0 m/s`;

        if (infoCommsChannelStatus) infoCommsChannelStatus.textContent = unknown;

        if (infoObjective) infoObjective.textContent = unknown;
        if (infoDirectiveReward) infoDirectiveReward.textContent = unknown;
        if (infoDirectiveStatus) infoDirectiveStatus.textContent = unknown;
        if (infoAlertLevel) {
            const alertKey = 'alert_level_green';
            infoAlertLevel.textContent = uiLangData[currentAppLanguage]?.[alertKey] || 'Green';
            infoAlertLevel.className = 'value status-ok';
        }

        if (infoLocation) infoLocation.textContent = unknown;
        if (infoSystemFaction) infoSystemFaction.textContent = unknown;
        if (infoEnvironment) infoEnvironment.textContent = unknown;
        if (infoSensorConditions) infoSensorConditions.textContent = unknown;
        if (infoStardate) infoStardate.textContent = unknown;

        // Use setMeter for enemy intel initialization
        if (infoEnemyShipType) infoEnemyShipType.textContent = unknown;
        setMeter(meterEnemyShields, infoEnemyShieldsStatus, '0', 'enemy_shields', { newStatusText: offlineText, initialPlaceholder: `${offlineText}: 0%` });
        setMeter(meterEnemyHull, infoEnemyHullIntegrity, '100', 'enemy_hull', { initialPlaceholder: '100%' });


        if (playerCallsignInput) playerCallsignInput.placeholder = uiLangData[currentAppLanguage]?.placeholder_callsign_login || "Enter callsign...";
        if (playerActionInput) playerActionInput.placeholder = uiLangData[currentAppLanguage]?.placeholder_command || "Enter command...";

        if (commsChannelConsoleBox) commsChannelConsoleBox.style.display = 'none';
        if (enemyIntelConsoleBox) enemyIntelConsoleBox.style.display = 'none';
    }

    function autoGrowTextarea(textarea) {
        if (!textarea) return;
        textarea.style.height = 'auto';
        let newHeight = textarea.scrollHeight;
        const maxHeight = parseInt(window.getComputedStyle(textarea).maxHeight, 10) || Infinity;

        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            textarea.style.overflowY = 'auto';
        } else {
            textarea.style.overflowY = 'hidden';
        }
        textarea.style.height = newHeight + 'px';
    }

    const consoleBoxAnimationConfig = [{
            id: 'ship-status-console-box',
            delay: 1200
        },
        {
            id: 'navigation-data-console-box',
            delay: 1200
        },
        {
            id: 'captain-status-console-box',
            delay: 300
        },
        {
            id: 'mission-intel-console-box',
            delay: 300
        }
    ];

    function animateConsoleBox(boxId, shouldExpand) {
        const box = document.getElementById(boxId);
        if (!box) {
            return;
        }
        const header = box.querySelector('.console-box-header');
        const content = box.querySelector('.console-box-content');
        if (!header || !content) {
            return;
        }

        if (shouldExpand && box.style.display === 'none') {
            box.style.display = 'block';
        }

        requestAnimationFrame(() => {
            if (shouldExpand) {
                box.classList.add('is-expanded');
                header.setAttribute('aria-expanded', 'true');
                content.setAttribute('aria-hidden', 'false');
            } else {
                box.classList.remove('is-expanded');
                header.setAttribute('aria-expanded', 'false');
                content.setAttribute('aria-hidden', 'true');
            }
        });
    }

    function triggerCockpitBootAnimation() {
        consoleBoxAnimationConfig.forEach(config => {
            setTimeout(() => {
                const box = document.getElementById(config.id);
                if (box) {
                    animateConsoleBox(config.id, true);
                }
            }, config.delay);
        });
    }

    function initializeCollapsibleConsoleBoxes() {
        const consoleBoxes = document.querySelectorAll('.console-box.collapsible');
        consoleBoxes.forEach(box => {
            const header = box.querySelector('.console-box-header');
            const content = box.querySelector('.console-box-content');

            if (header && content) {
                const isStandardBootConsole = consoleBoxAnimationConfig.some(c => c.id === box.id);
                const isConditionalConsole = box.id === 'comms-channel-console-box' || box.id === 'enemy-intel-console-box';

                if (isStandardBootConsole) {
                    box.style.display = 'block';
                    header.setAttribute('aria-expanded', 'false');
                    content.setAttribute('aria-hidden', 'true');
                } else if (isConditionalConsole) {
                    box.style.display = 'none';
                    header.setAttribute('aria-expanded', 'false');
                    content.setAttribute('aria-hidden', 'true');
                    box.classList.remove('is-expanded');
                } else {
                    box.style.display = 'block';
                    box.classList.add('is-expanded');
                    header.setAttribute('aria-expanded', 'true');
                    content.setAttribute('aria-hidden', 'false');
                }


                header.addEventListener('click', () => {
                    if (box.style.display !== 'none') {
                        const isNowExpanded = !box.classList.contains('is-expanded');
                        animateConsoleBox(box.id, isNowExpanded);
                    }
                });

                header.setAttribute('tabindex', '0');
                header.addEventListener('keydown', (e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && box.style.display !== 'none') {
                        e.preventDefault();
                        const isNowExpanded = !box.classList.contains('is-expanded');
                        animateConsoleBox(box.id, isNowExpanded);
                    }
                });
            }
        });
    }

    async function initializeApp() {
        setAppLanguage(currentAppLanguage); // This also calls initializeDashboardDefaultTexts

        if (systemStatusIndicator) {
            systemStatusIndicator.textContent = (uiLangData[currentAppLanguage]?.standby || "Standby");
            systemStatusIndicator.className = 'status-indicator status-warning';
        }

        const promptsLoaded = await loadAllPrompts();

        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE" || !promptsLoaded) {
            const errorMsg = !promptsLoaded ? "CRITICAL: Failed to load game prompts." : "CRITICAL: API Key not configured.";
            console.error(errorMsg);
            addMessageToLog(errorMsg, 'system');
            if (systemStatusIndicator) {
                systemStatusIndicator.textContent = (uiLangData[currentAppLanguage]?.status_error || "Error");
                systemStatusIndicator.className = 'status-indicator status-danger';
            }
            if (startGameButton) startGameButton.disabled = true;
            if (playerCallsignInput) playerCallsignInput.disabled = true;
            if (playerActionInput) playerActionInput.disabled = true;
            if (sendActionButton) sendActionButton.disabled = true;
            if (languageToggleButton) languageToggleButton.disabled = true;
        } else {
            if (playerCallsignInput) playerCallsignInput.focus();
        }

        clearSuggestedActions();
        initializeCollapsibleConsoleBoxes();
        if (playerActionInput) {
            autoGrowTextarea(playerActionInput);
        }
    }

    // Event Listeners
    if (languageToggleButton) languageToggleButton.addEventListener('click', toggleAppLanguage);
    if (startGameButton) startGameButton.addEventListener('click', startGame);
    if (playerCallsignInput) playerCallsignInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startGame();
    });
    if (sendActionButton) sendActionButton.addEventListener('click', sendPlayerAction);
    if (playerActionInput) {
        playerActionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendPlayerAction();
            }
        });
        playerActionInput.addEventListener('input', () => autoGrowTextarea(playerActionInput));
    }

    initializeApp();
});