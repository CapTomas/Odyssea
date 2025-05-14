document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const GEMINI_API_KEY = "AIzaSyA84Kyu7r2tTnaP_u5q9dd-B4NiTnwDkso"; // <--- REPLACE THIS!
    const DEFAULT_LANGUAGE = 'en';
    const UPDATE_HIGHLIGHT_DURATION = 5000; // ms for dashboard update highlight (5 seconds)

    // --- DOM Elements ---
    // Top Bar
    const gameTitleElement = document.getElementById('game-title');
    const systemStatusIndicator = document.getElementById('system-status-indicator');
    const gmSpecificActivityIndicator = document.getElementById('gm-activity-indicator');
    const languageToggleButton = document.getElementById('language-toggle-button');

    // Left Context Panel (Elements are inside collapsible boxes now, but IDs remain the same)
    const infoShipName = document.getElementById('info-ship-name');
    const infoShipType = document.getElementById('info-ship-type');
    const meterShipIntegrity = document.getElementById('meter-ship-integrity');
    const infoShipIntegrity = document.getElementById('info-ship-integrity');
    const meterShipShields = document.getElementById('meter-ship-shields');
    const infoShipShields = document.getElementById('info-ship-shields');
    const infoShipCargo = document.getElementById('info-ship-cargo');
    const infoShipSpeed = document.getElementById('info-ship-speed');

    const infoPlayerCallsign = document.getElementById('info-player-callsign');
    const infoPlayerCredits = document.getElementById('info-player-credits');
    const infoPlayerReputation = document.getElementById('info-player-reputation');
    const infoPlayerAffiliation = document.getElementById('info-player-affiliation');

    // Right Context Panel
    const infoObjective = document.getElementById('info-objective');
    const infoDirectiveReward = document.getElementById('info-directive-reward');
    const infoAlertLevel = document.getElementById('info-alert-level');
    const infoLocation = document.getElementById('info-location');
    const infoSystemFaction = document.getElementById('info-system-faction');
    const infoStardate = document.getElementById('info-stardate');

    // Center Interaction Area
    const storyLog = document.getElementById('story-log');
    const suggestedActionsWrapper = document.getElementById('suggested-actions-wrapper');
    const nameInputSection = document.getElementById('name-input-section');
    const playerCallsignInput = document.getElementById('player-name-input');
    const startGameButton = document.getElementById('start-game-button');
    const actionInputSection = document.getElementById('action-input-section');
    const playerActionInput = document.getElementById('player-action-input');
    const sendActionButton = document.getElementById('send-action-button');

    // --- Game State ---
    let gameHistory = [];
    let playerCallsign = '';
    let currentAppLanguage = localStorage.getItem('preferredAppLanguage') || DEFAULT_LANGUAGE;
    let currentNarrativeLanguage = localStorage.getItem('preferredNarrativeLanguage') || DEFAULT_LANGUAGE;

    // --- Language Definitions ---
    const uiLangData = {
        en: {
          "toggle_language": "English",
          "aria_label_toggle_language": "Switch to English",
          "system_status_online_short": "Core Systems Online",
          "system_processing_short": "Running Calculations...",
          "title_ship_status": "Ship Diagnostics",
          "title_captain_status": "Captain's Log",
          "label_ship_name": "Ship Registry:",
          "label_ship_type": "Vessel Class:",
          "label_ship_integrity": "Hull Status:",
          "label_ship_shields": "Shield Strength:",
          "label_ship_cargo": "Cargo Hold:",
          "label_ship_speed": "Cruising Velocity:",
          "label_player_callsign": "Captain's name:",
          "label_player_credits": "Credit Balance:",
          "label_player_reputation": "Galactic Standing:",
          "label_player_affiliation": "Allegiance:",
          "title_active_directive": "Current Directive",
          "title_navigation_data": "Navigation Console",
          "label_directive_details": "Mission Briefing:",
          "label_directive_reward": "Reward Estimate:",
          "label_alert_level": "Alert Status:",
          "label_current_location": "Coordinates:",
          "label_system_faction": "Sector Authority:",
          "label_stardate": "Stardate:",
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
        },
        cs: {
          "toggle_language": "Česky",
          "aria_label_toggle_language": "Přepnout do Češtiny",
          "system_status_online_short": "Základní systémy online",
          "system_processing_short": "Probíhá výpočet...",
          "title_ship_status": "Diagnostika Lodi",
          "title_captain_status": "Kapitánský Záznam",
          "label_ship_name": "Registrace Lodi:",
          "label_ship_type": "Třída Plavidla:",
          "label_ship_integrity": "Stav Trupu:",
          "label_ship_shields": "Síla Štítů:",
          "label_ship_cargo": "Nákladový Prostor:",
          "label_ship_speed": "Letová Rychlost:",
          "label_player_callsign": "Jméno Kapitána:",
          "label_player_credits": "Kreditní Zůstatek:",
          "label_player_reputation": "Pověst ve Vesmíru:",
          "label_player_affiliation": "Příslušnost:",
          "title_active_directive": "Aktuální Mise",
          "title_navigation_data": "Navigační Konzole",
          "label_directive_details": "Brífink Mise:",
          "label_directive_reward": "Odhadovaná Odměna:",
          "label_alert_level": "Stav Poplachu:",
          "label_current_location": "Souřadnice:",
          "label_system_faction": "Autorita Sektoru:",
          "label_stardate": "Hvězdné Datum:",
          "placeholder_callsign_login": "Zadejte své jméno pro přístup k lodním systémům...",
          "placeholder_command": "Zadejte příkaz nebo otevřete komunikaci...",
          "button_access_systems": "Připojit",
          "button_execute_command": "Odeslat",
          "status_ok": "Funguje",
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
        }
      };


    const NARRATIVE_LANG_PROMPT_PARTS = {
        en: `This narrative must be written in fluent, immersive English, suitable for a high-quality sci-fi novel. Dialogue should be natural.`,
        cs: `Tento příběh musí být napsán plynulou, poutavou češtinou, vhodnou pro kvalitní sci-fi román. Dialogy by měly být přirozené.`
    };

    // --- UI Language Functions ---
    function setAppLanguage(lang) {
        currentAppLanguage = lang;
        localStorage.setItem('preferredAppLanguage', lang);
        if (document.documentElement) {
            document.documentElement.lang = lang;
        }

        // Update textContent for elements with data-lang-key
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (uiLangData[lang] && uiLangData[lang][key]) {
                if ( (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') ) {
                    // This condition ensures console box titles (which are H3) get updated,
                    // and other non-input/textarea elements also get updated.
                    if (!el.classList.contains('console-box-title') || el.tagName.toLowerCase() === 'h3') {
                         el.textContent = uiLangData[lang][key];
                    }
                }
            }
        });

        // Update placeholders for elements with data-lang-key-placeholder
        document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-key-placeholder');
            if (uiLangData[lang] && uiLangData[lang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = uiLangData[lang][key];
                }
            }
        });

        // Update aria-labels for elements with data-lang-key-aria
         document.querySelectorAll('[data-lang-key-aria]').forEach(el => {
            const key = el.getAttribute('data-lang-key-aria');
            if (uiLangData[lang] && uiLangData[lang][key]) {
                el.setAttribute('aria-label', uiLangData[lang][key]);
            }
        });

        // Update language toggle button text
        if (languageToggleButton) {
            const otherLang = lang === 'en' ? 'cs' : 'en';
            languageToggleButton.textContent = uiLangData[otherLang]?.toggle_language || (otherLang === 'cs' ? 'Česky' : 'English');
            // Ensure aria-label for the button reflects the action for the *current* language setting
            const ariaKeyForToggleAction = `aria_label_toggle_language`; // This key should mean "Switch to other language"
            const ariaLabelText = uiLangData[otherLang]?.[ariaKeyForToggleAction] || `Switch to ${otherLang === 'cs' ? 'Czech' : 'English'}`;
            languageToggleButton.setAttribute('aria-label', ariaLabelText);
        }
        initializeDashboardDefaultTexts(); // Re-apply defaults, which might use current language for some static texts
    }

    function toggleAppLanguage() {
        const newLang = currentAppLanguage === 'en' ? 'cs' : 'en';
        setAppLanguage(newLang);
        currentNarrativeLanguage = newLang; // Sync narrative language with UI language
        localStorage.setItem('preferredNarrativeLanguage', newLang);

        const systemMessageKey = newLang === 'en' ? "system_lang_set_en" : "system_lang_set_cs";
        let systemMessage = uiLangData[newLang]?.[systemMessageKey] || `System: UI & Narrative language set to ${newLang.toUpperCase()}.`;
        addMessageToLog(systemMessage, 'system');
    }

    // --- System Prompt for AI ---
    const getSystemPrompt = (currentCallsignForPrompt) => {
        const narrativeLanguageInstruction = NARRATIVE_LANG_PROMPT_PARTS[currentNarrativeLanguage] || NARRATIVE_LANG_PROMPT_PARTS[DEFAULT_LANGUAGE];

        return `You are the Game Master (GM) for "Odyssey," a text-based space simulation RPG. The player begins by providing their callsign.
        Your role is to weave a compelling narrative, manage the game world, and control NPC interactions. The player makes choices that influence the story.

        GAME WORLD: A procedurally generated galaxy awaits exploration. Events and faction dynamics should respond to player actions. Introduce world elements organically.

        NARRATIVE STYLE: Adopt the tone of an immersive sci-fi novel. Craft natural dialogue, build emotional depth, and maintain suspense. Avoid common tropes. Place the player directly into engaging scenarios and preserve an air of mystery.
        **CRITICAL: Never explicitly ask "What do you do?". Player choices should be inferred from their input or provided through the \`suggested_actions\` JSON field.**

        GAMEPLAY: The story unfolds continuously. Player input, whether typed or selected from suggestions, drives the narrative forward. Always conclude your response with a narrative thread or actionable suggestions.

        JSON OUTPUT (MANDATORY): Your ENTIRE response MUST be a single, valid JSON object. Do not include any text outside this JSON structure.
        {
            "narrative": "string (This is the primary story text. **CRITICAL NARRATIVE LANGUAGE REQUIREMENT: ${narrativeLanguageInstruction}** All text within this 'narrative' string MUST be in the specified language. Use markdown _italics_ for thoughts or emphasis, and ensure newlines are appropriately used for paragraph breaks like '\\n\\n'.)",
            "dashboard_updates": {
                // object: Key-value pairs for dashboard fields that have changed. Omit any field if its value has not changed since the last update.
                // EXCEPTION: For the very first turn of the game, provide ALL dashboard fields with initial values.
                // Keys: "callsign", "shipName", "shipType", "integrityPct", "shieldsStatus" (e.g., "Online", "Offline", "Damaged"), "shieldsPct",
                //       "cargo" (e.g., "50/120 SCU"), "currentShipSpeed" (e.g., "850 m/s" or "Warp Factor 2.1"),
                //       "credits" (e.g., "12500 UEC"), "reputation" (e.g., "Neutral +1"), "affiliation" (e.g., "Independent"),
                //       "objective" (a concise mission summary), "directiveReward" (e.g., "5000 UEC, +5 UEF Rep" or "Unknown Cache"),
                //       "alertLevel" (e.g., "Condition Green", "Yellow Alert", "Red Alert"),
                //       "location" (e.g., "Orbiting Terra Prime, Sol System"), "systemFaction" (e.g., "United Earth Federation"), "stardate" (e.g., "2378.45")
                // Values are strings. Percentages are 0-100. currentShipSpeed can be textual for warp. directiveReward can be descriptive.
                // IMPORTANT FOR SHIELDS: If shieldsStatus changes (e.g. to "Offline"), shieldsPct should also be sent (e.g. "0"). If status changes but percentage number is the same (e.g. "Online" at 50% to "Damaged" at 50%), send both shieldsStatus and shieldsPct.
            },
            "suggested_actions": [
                // array of 2-3 short, actionable strings for the player's next move. These MUST also be in the NARRATIVE language (${currentNarrativeLanguage.toUpperCase()}).
                "Example: Scan the anomaly.", "Example: Hail the unidentified vessel.", "Example: Increase speed to full impulse."
            ]
        }

        STARTING THE GAME: The player's callsign is ${currentCallsignForPrompt || 'UNKNOWN_CAPTAIN'}.
        Immediately begin the story. Assign a ship, place them in a specific location, and present an initial situation.
        In your first \`dashboard_updates\` object, you MUST populate ALL fields, including setting "callsign": "${currentCallsignForPrompt || 'UNKNOWN_CAPTAIN'}".
        Provide 3 initial \`suggested_actions\` relevant to the starting scenario.

        **FINAL LANGUAGE REMINDER: The 'narrative' content AND all 'suggested_actions' strings MUST be in ${currentNarrativeLanguage.toUpperCase()}. This is a non-negotiable requirement.**
        Ensure your entire response is only the JSON object. No introductory text or explanations.
        `;
    };

    // --- UI Update Functions ---
    function highlightElementUpdate(element) {
        if (!element) return;
        // Target the parent .info-item or .info-item-meter for the highlight effect via CSS ::after
        const target = element.closest('.info-item, .info-item-meter');
        if (target) {
            target.classList.add('value-updated');
            setTimeout(() => {
                target.classList.remove('value-updated');
            }, UPDATE_HIGHLIGHT_DURATION);
        } else if (element.classList.contains('value')) { // Fallback for direct value elements if not in a standard item
             element.classList.add('value-updated'); // This will use direct background flash
             setTimeout(() => {
                element.classList.remove('value-updated');
            }, UPDATE_HIGHLIGHT_DURATION);
        }
    }

    function addMessageToLog(text, sender) {
        if (!storyLog) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        // Convert markdown italics _text_ or *text* to <em>text</em>
        text = text.replace(/_([^_]+)_|\*([^*]+)\*/g, (match, p1, p2) => `<em>${p1 || p2}</em>`);

        // Split by double newlines for paragraphs, then handle single newlines as <br> within paragraphs
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '');
        if (paragraphs.length === 0 && text.trim() !== '') { // Handle case where there are no double newlines but text exists
            paragraphs.push(text.trim());
        }

        paragraphs.forEach(paraText => {
            const p = document.createElement('p');
            p.innerHTML = paraText.replace(/\n/g, '<br>'); // Convert single newlines to <br>
            messageDiv.appendChild(p);
        });

        storyLog.appendChild(messageDiv);
        if (storyLog.parentElement) { // Ensure viewport scrolls down
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

    function updateDashboard(updates) {
        if (!updates) return;
        const unknown = uiLangData[currentAppLanguage]?.unknown || '---';
        const naShort = uiLangData[currentAppLanguage]?.not_available_short || 'N/A';

        const setText = (el, value, options = {}) => {
            const { suffix = '', defaultValue = unknown, highlight = true, initialPlaceholder = unknown } = options;
            if (el) {
                const currentVal = el.textContent;
                if (value !== undefined && value !== null) { // Only update if new value is provided
                    const newVal = `${value}${suffix}`;
                    if (currentVal !== newVal) {
                        el.textContent = newVal;
                        if (highlight) highlightElementUpdate(el);
                    }
                } else if (currentVal === '' || currentVal === initialPlaceholder || currentVal === defaultValue ) {
                    el.textContent = defaultValue;
                }
            }
        };

        const setMeter = (barEl, textEl, valuePctStr, _textValueUnused, options = {}) => {
            const { highlight = true, onlineStatus } = options; // onlineStatus is updates.shieldsStatus

            const newPercentageProvided = (valuePctStr !== undefined && valuePctStr !== null);
            const newStatusProvided = (onlineStatus !== undefined); // True if AI sent a new shieldsStatus

            let visualPct; // To store the numeric percentage
            let currentActualStatus = onlineStatus; // Use AI-provided status by default
            let barStyleChanged = false; // Flag to track if bar visuals changed for highlighting

            if (newPercentageProvided) {
                const pctNum = parseInt(valuePctStr, 10);
                visualPct = Math.max(0, Math.min(100, isNaN(pctNum) ? 0 : pctNum));

                const currentTextVal = textEl.textContent;
                let newTextContent = currentTextVal;

                if (barEl === meterShipShields) {
                    if (currentActualStatus === undefined) { // No explicit status from AI with this percentage update
                        currentActualStatus = (visualPct > 0) ?
                                              (uiLangData[currentAppLanguage]?.online || 'Online') :
                                              (uiLangData[currentAppLanguage]?.offline || 'Offline');
                    }
                    const localizedStatusKey = String(currentActualStatus).toLowerCase().replace(/\s+/g, '_');
                    const localizedStatus = uiLangData[currentAppLanguage]?.[localizedStatusKey] || currentActualStatus;
                    newTextContent = `${localizedStatus}: ${visualPct}%`;

                    let newBarColor;
                    let newBarWidth = `${visualPct}%`;

                    if (String(currentActualStatus).toLowerCase() === 'offline') {
                        newBarColor = 'var(--color-status-offline-bar)';
                        newBarWidth = '0%';
                    } else {
                        newBarColor = 'var(--color-status-info-bar)';
                        if (visualPct < 25) newBarColor = 'var(--color-status-danger-bar)';
                        else if (visualPct < 60) newBarColor = 'var(--color-status-warning-bar)';
                    }

                    if (barEl.style.backgroundColor !== newBarColor) {
                        barEl.style.backgroundColor = newBarColor;
                        barStyleChanged = true;
                    }
                    if (barEl.style.width !== newBarWidth) {
                        barEl.style.width = newBarWidth;
                        barStyleChanged = true;
                    }

                } else { // For integrity meter
                    newTextContent = `${visualPct}%`;
                    let newBarColor = 'var(--color-status-ok-bar)';
                    if (visualPct < 25) newBarColor = 'var(--color-status-danger-bar)';
                    else if (visualPct < 60) newBarColor = 'var(--color-status-warning-bar)';
                    
                    if (barEl.style.backgroundColor !== newBarColor) {
                        barEl.style.backgroundColor = newBarColor;
                        barStyleChanged = true;
                    }
                    if (barEl.style.width !== `${visualPct}%`) {
                        barEl.style.width = `${visualPct}%`;
                        barStyleChanged = true;
                    }
                }

                if (currentTextVal !== newTextContent) {
                    textEl.textContent = newTextContent;
                    if (highlight) highlightElementUpdate(textEl);
                } else if (barStyleChanged && highlight) { // Text same, but bar changed
                    highlightElementUpdate(textEl);
                }

            } else if (barEl === meterShipShields && newStatusProvided) {
                // NO new percentage, BUT this IS the shield meter AND a new status IS provided.
                // This handles status text changes when percentage number is the same.
                const currentTextVal = textEl.textContent;
                let existingPct = 0; // Default
                const match = currentTextVal.match(/(\d+)%/); // Try to parse current percentage from text
                if (match && match[1]) {
                    existingPct = parseInt(match[1], 10);
                } else if (String(onlineStatus).toLowerCase() === 'offline') {
                     existingPct = 0; // If going offline and can't parse, assume 0%
                }
                visualPct = existingPct; // Use the parsed/defaulted existing percentage

                // currentActualStatus is already `onlineStatus` (the new status from AI)
                const localizedStatusKey = String(onlineStatus).toLowerCase().replace(/\s+/g, '_');
                const localizedStatus = uiLangData[currentAppLanguage]?.[localizedStatusKey] || onlineStatus;
                const newTextContent = `${localizedStatus}: ${visualPct}%`;

                if (currentTextVal !== newTextContent) {
                    textEl.textContent = newTextContent;
                    if (highlight) highlightElementUpdate(textEl);
                }

                // Update bar style if status implies it (e.g., offline -> 0% width, specific color)
                let newBarColor;
                let newBarWidth = `${visualPct}%`; // Default to existing percentage width

                if (String(onlineStatus).toLowerCase() === 'offline') {
                    newBarColor = 'var(--color-status-offline-bar)';
                    newBarWidth = '0%';
                } else {
                    newBarColor = 'var(--color-status-info-bar)';
                    if (visualPct < 25) newBarColor = 'var(--color-status-danger-bar)';
                    else if (visualPct < 60) newBarColor = 'var(--color-status-warning-bar)';
                }
                
                if (barEl.style.backgroundColor !== newBarColor) {
                    barEl.style.backgroundColor = newBarColor;
                    barStyleChanged = true;
                }
                if (barEl.style.width !== newBarWidth) {
                    barEl.style.width = newBarWidth;
                    barStyleChanged = true;
                }

                if (barStyleChanged && highlight && currentTextVal === newTextContent) {
                    // If only bar changed (text was same, but became different due to status)
                    // or if text didn't change but bar did.
                    highlightElementUpdate(textEl);
                }
            }
        };


        setText(infoPlayerCallsign, updates.callsign, { initialPlaceholder: unknown });
        setText(infoShipName, updates.shipName, { initialPlaceholder: unknown });
        setText(infoShipType, updates.shipType, { initialPlaceholder: unknown });
        setText(infoShipCargo, updates.cargo, { initialPlaceholder: `${naShort}/${naShort} SCU` });
        setText(infoShipSpeed, updates.currentShipSpeed, {
            suffix: (updates.currentShipSpeed && typeof updates.currentShipSpeed === 'string' && !/[a-zA-Z]/.test(updates.currentShipSpeed.trim()) && !updates.currentShipSpeed.includes('m/s') && !updates.currentShipSpeed.includes('km/s')) ? ' m/s' : '',
            initialPlaceholder: `0 m/s`
        });
        setText(infoPlayerCredits, updates.credits, {
            suffix: (updates.credits && typeof updates.credits === 'string' && !/[a-zA-Z]/.test(updates.credits.trim()) && !updates.credits.toLowerCase().includes('uec')) ? ' UEC' : '',
            initialPlaceholder: `${unknown} UEC`
        });
        setText(infoPlayerReputation, updates.reputation, { initialPlaceholder: unknown });
        setText(infoPlayerAffiliation, updates.affiliation, { initialPlaceholder: unknown });
        setText(infoObjective, updates.objective, { initialPlaceholder: unknown });
        setText(infoDirectiveReward, updates.directiveReward, { initialPlaceholder: unknown });
        setText(infoLocation, updates.location, { initialPlaceholder: unknown });
        setText(infoSystemFaction, updates.systemFaction, { initialPlaceholder: unknown });
        setText(infoStardate, updates.stardate, { initialPlaceholder: unknown });

        setMeter(meterShipIntegrity, infoShipIntegrity, updates.integrityPct, null, {
            initialPlaceholder: '100%'
        });
        setMeter(meterShipShields, infoShipShields, updates.shieldsPct, null, {
            onlineStatus: updates.shieldsStatus,
            initialPlaceholder: `${uiLangData[currentAppLanguage]?.online || 'Online'}: 100%`
        });

        if (infoAlertLevel) {
            const initialAlertPlaceholder = uiLangData[currentAppLanguage]?.status_ok || 'Condition Green';
            if (updates.alertLevel !== undefined) {
                const currentAlertText = infoAlertLevel.textContent;
                if (currentAlertText !== updates.alertLevel) {
                    infoAlertLevel.textContent = updates.alertLevel;
                    infoAlertLevel.className = 'value'; 
                    const lowerVal = String(updates.alertLevel).toLowerCase();
                    if (lowerVal.includes('green') || lowerVal.includes('nominal') || lowerVal.includes('blue') || lowerVal.includes('v pořádku') || lowerVal.includes('operational')) infoAlertLevel.classList.add('status-ok');
                    else if (lowerVal.includes('yellow') || lowerVal.includes('minor') || lowerVal.includes('varování') || lowerVal.includes('caution')) infoAlertLevel.classList.add('status-warning');
                    else if (lowerVal.includes('red') || lowerVal.includes('critical') || lowerVal.includes('danger') || lowerVal.includes('nebezpečí')) infoAlertLevel.classList.add('status-danger');
                    else infoAlertLevel.classList.add('status-info'); 
                    highlightElementUpdate(infoAlertLevel);
                }
            } else if (infoAlertLevel.textContent === '' || infoAlertLevel.textContent === unknown || infoAlertLevel.textContent === initialAlertPlaceholder) {
                infoAlertLevel.textContent = initialAlertPlaceholder;
                infoAlertLevel.className = 'value status-ok';
            }
        }
    }

    function displaySuggestedActions(actions) {
        if (!suggestedActionsWrapper) return;
        suggestedActionsWrapper.innerHTML = ''; // Clear previous
        if (actions && Array.isArray(actions) && actions.length > 0) {
            actions.slice(0, 3).forEach(actionText => { // Max 3 suggestions
                if (typeof actionText === 'string' && actionText.trim() !== '') {
                    const button = document.createElement('button');
                    button.classList.add('ui-button');
                    button.textContent = actionText;
                    button.addEventListener('click', () => {
                        if (playerActionInput) {
                            playerActionInput.value = actionText;
                            playerActionInput.focus();
                            playerActionInput.dispatchEvent(new Event('input', { bubbles: true }));
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

    // --- API Call ---
    async function callGeminiAPI(currentTurnHistory) {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE" ) { 
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

        const systemPromptText = getSystemPrompt(playerCallsign);

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

        let payload = {
            contents: currentTurnHistory,
            generationConfig: {
                temperature: 0.7, topP: 0.95, maxOutputTokens: 4096, responseMimeType: "application/json",
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            ],
            systemInstruction: { parts: [{text: systemPromptText}] }
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            });
            const responseData = await response.json();

            if (!response.ok) {
                console.error("API Error Response:", responseData);
                let errDetail = responseData.error?.message || `API Error ${response.status}`;
                if(responseData.error?.details) { errDetail += ` Details: ${JSON.stringify(responseData.error.details)}`; }
                throw new Error(errDetail);
            }

            if (responseData.candidates && responseData.candidates[0]?.content?.parts?.[0]?.text) {
                let jsonStr = responseData.candidates[0].content.parts[0].text;
                try {
                    const parsed = JSON.parse(jsonStr);
                    if (typeof parsed.narrative !== 'string' || typeof parsed.dashboard_updates !== 'object' || !Array.isArray(parsed.suggested_actions)) {
                        console.error("Parsed JSON structure is invalid:", parsed);
                        throw new Error("Invalid JSON structure from AI.");
                    }
                    gameHistory.push({ role: "model", parts: [{ text: JSON.stringify(parsed) }] }); 
                    updateDashboard(parsed.dashboard_updates);
                    displaySuggestedActions(parsed.suggested_actions);

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
                const blockDetails = responseData.promptFeedback.safetyRatings?.map(r=>r.category+': '+r.probability).join(', ')||"No specific details.";
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

    // --- Game Flow ---
    async function startGame() {
        playerCallsign = playerCallsignInput ? playerCallsignInput.value.trim() : "";
        if (!playerCallsign) {
            alert(uiLangData[currentAppLanguage]?.placeholder_enter_callsign || "Please enter your callsign.");
            if (playerCallsignInput) playerCallsignInput.focus();
            return;
        }

        if (nameInputSection) nameInputSection.style.display = 'none';
        if (actionInputSection) actionInputSection.style.display = 'flex';
        if (playerActionInput) {
             playerActionInput.value = '';
             playerActionInput.dispatchEvent(new Event('input', { bubbles: true })); 
        }


        updateDashboard({ callsign: playerCallsign }); 
        addMessageToLog(`${uiLangData[currentAppLanguage]?.connecting || 'Connecting as'}: ${playerCallsign}...`, 'system');

        gameHistory = [{ role: "user", parts: [{ text: `My callsign is ${playerCallsign}. I am ready to start the game.` }] }];
        clearSuggestedActions(); 

        const narrative = await callGeminiAPI(gameHistory);
        if (narrative) {
            addMessageToLog(narrative, 'gm');
            triggerCockpitBootAnimation(); 
        } else {
            if (nameInputSection) nameInputSection.style.display = 'flex';
            if (actionInputSection) actionInputSection.style.display = 'none';
            addMessageToLog("Failed to initialize session. Please check console and try again.", 'system');
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
            playerActionInput.dispatchEvent(new Event('input', { bubbles: true })); 
        }
        clearSuggestedActions();

        gameHistory.push({ role: "user", parts: [{ text: action }] }); 
        const narrative = await callGeminiAPI(gameHistory); 
        if (narrative) {
            addMessageToLog(narrative, 'gm');
        }
    }

    function initializeDashboardDefaultTexts() {
        const unknown = uiLangData[currentAppLanguage]?.unknown || '---';
        const na = '--'; 

        if (infoShipName) infoShipName.textContent = unknown;
        if (infoShipType) infoShipType.textContent = unknown;

        if (infoShipIntegrity) infoShipIntegrity.textContent = '100%';
        if (meterShipIntegrity) { meterShipIntegrity.style.width = '100%'; meterShipIntegrity.style.backgroundColor = 'var(--color-status-ok-bar)';}

        if (infoShipShields) infoShipShields.textContent = `${uiLangData[currentAppLanguage]?.online || 'Online'}: 100%`;
        if (meterShipShields) { meterShipShields.style.width = '100%'; meterShipShields.style.backgroundColor = 'var(--color-status-info-bar)';} 

        if (infoShipCargo) infoShipCargo.textContent = `${na}/${na} SCU`;
        if (infoShipSpeed) infoShipSpeed.textContent = `0 m/s`;

        if (infoPlayerCallsign && !playerCallsign) infoPlayerCallsign.textContent = unknown; 
        else if (infoPlayerCallsign && playerCallsign) infoPlayerCallsign.textContent = playerCallsign;

        if (infoPlayerCredits) infoPlayerCredits.textContent = `${na} UEC`;
        if (infoPlayerReputation) infoPlayerReputation.textContent = unknown;
        if (infoPlayerAffiliation) infoPlayerAffiliation.textContent = unknown;
        if (infoObjective) infoObjective.textContent = unknown;
        if (infoDirectiveReward) infoDirectiveReward.textContent = unknown;
        if (infoAlertLevel) {
            infoAlertLevel.textContent = uiLangData[currentAppLanguage]?.status_ok || 'Condition Green';
            infoAlertLevel.className = 'value status-ok';
        }
        if (infoLocation) infoLocation.textContent = unknown;
        if (infoSystemFaction) infoSystemFaction.textContent = unknown;
        if (infoStardate) infoStardate.textContent = unknown;

        if (playerCallsignInput) {
            playerCallsignInput.placeholder = uiLangData[currentAppLanguage]?.placeholder_callsign_login || "Enter callsign...";
        }
        if (playerActionInput) {
            playerActionInput.placeholder = uiLangData[currentAppLanguage]?.placeholder_command || "Enter command...";
        }
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


    // --- Event Listeners ---
    if (languageToggleButton) languageToggleButton.addEventListener('click', toggleAppLanguage);
    if (startGameButton) startGameButton.addEventListener('click', startGame);
    if (playerCallsignInput) playerCallsignInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') startGame(); });
    if (sendActionButton) sendActionButton.addEventListener('click', sendPlayerAction);
    if (playerActionInput) {
        playerActionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                sendPlayerAction();
            }
        });
        playerActionInput.addEventListener('input', () => {
            autoGrowTextarea(playerActionInput);
        });
    }

    // --- Collapsible Console Box & Animation ---
    const consoleBoxAnimationConfig = [
        { id: 'ship-status-console-box', delay: 1200 },    
        { id: 'navigation-data-console-box', delay: 1200 }, 
        { id: 'captain-status-console-box', delay: 300 }, 
        { id: 'mission-intel-console-box', delay: 300 }   
    ];

    function animateConsoleBox(boxId, shouldExpand) {
        const box = document.getElementById(boxId);
        if (box) {
            const header = box.querySelector('.console-box-header');
            const content = box.querySelector('.console-box-content');
            if (!header || !content) return;

            if (shouldExpand) {
                box.classList.add('is-expanded');
                header.setAttribute('aria-expanded', 'true');
                content.setAttribute('aria-hidden', 'false');
            } else {
                box.classList.remove('is-expanded');
                header.setAttribute('aria-expanded', 'false');
                content.setAttribute('aria-hidden', 'true');
            }
        }
    }

    function triggerCockpitBootAnimation() {
        consoleBoxAnimationConfig.forEach(config => {
            setTimeout(() => {
                animateConsoleBox(config.id, true); 
            }, config.delay);
        });
    }

    function initializeCollapsibleConsoleBoxes() {
        const consoleBoxes = document.querySelectorAll('.console-box.collapsible');

        consoleBoxes.forEach(box => {
            const header = box.querySelector('.console-box-header');
            const content = box.querySelector('.console-box-content');

            if (header && content) {
                const isInitiallyExpanded = box.classList.contains('is-expanded');
                animateConsoleBox(box.id, isInitiallyExpanded); 

                header.addEventListener('click', () => {
                    const isNowExpanded = !box.classList.contains('is-expanded');
                    animateConsoleBox(box.id, isNowExpanded);
                });

                header.setAttribute('tabindex', '0'); 
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const isNowExpanded = !box.classList.contains('is-expanded');
                        animateConsoleBox(box.id, isNowExpanded);
                    }
                });
            }
        });
    }

    // --- Initial Setup ---
    function initializeApp() {
        setAppLanguage(currentAppLanguage); 

        if (systemStatusIndicator) {
            systemStatusIndicator.textContent = (uiLangData[currentAppLanguage]?.standby || "Standby");
            systemStatusIndicator.className = 'status-indicator status-warning'; 
        }

        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE" ) {
            const errorMsg = "CRITICAL: API Key not configured. Please replace placeholder in script.js.";
            console.error(errorMsg);
            if (storyLog) { addMessageToLog(errorMsg, 'system'); }
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

    initializeApp();
});