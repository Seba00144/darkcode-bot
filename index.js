const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, ChannelType, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const KANAL_LOBBY = "1566564742493900940";
const KANAL_WERYFIKACJA = "1566565260301705266";
const KANAL_REKRUTACJA = "1566555107821232229";
const KANAL_TICKET = "1566559806473379980";
const KANAL_WYNIKI = "1566553678343569619";

const ROLE_NIEZWERYFIKOWANY = "Niezweryfikowany";
const ROLE_ZWERYFIKOWANY = "DarkCode-użytkownik";
const ROLE_TICKET = "DarkCode-Ticket";

// Link do Twojej grafiki DarkCode
const GRAFIKA_BANNER = "https://cdn.discordapp.com/attachments/1566553678343569619/1566776139073064970/Zrzut_ekranu_2026-11-01_195913.png?ex=6ae9c57c&is=6ae873fc&hm=f7c21259db3afb1f7bc4eec902634ea49f41b4a977ed6fcb7b697e09e53e8540&"; 

client.once('ready', () => {
    console.log(`Zalogowano jako ${client.user.tag}! Bot DarkCode działa w pełnej gotowości.`);
});

// 1. Powitanie i ranga przy wejściu
client.on('guildMemberAdd', async member => {
    const role = member.guild.roles.cache.find(r => r.name === ROLE_NIEZWERYFIKOWANY);
    if (role) {
        try { await member.roles.add(role); } catch (err) {}
    }

    const channel = member.guild.channels.cache.get(KANAL_LOBBY);
    if (channel) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: "System Powitań • DarkCode", iconURL: member.guild.iconURL() })
            .setTitle("✨ NOWY GRACZ NA POKŁADZIE!")
            .setDescription(`Cześć ${member}! Witaj na oficjalnym serwerze **DarkCode** – Twoim źródle najlepszych skryptów i projektów Minecraft! 🚀\n\n> 🛡️ Aby odblokować pełny dostęp do serwera, przejdź na kanał **weryfikacji** i postępuj zgodnie z instrukcjami.`)
            .setColor(0x5865F2)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setImage(GRAFIKA_BANNER || null)
            .setFooter({ text: "Życzymy miłego pobytu!", iconURL: member.guild.iconURL() })
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
});

// 2. Komendy administracyjne i panele
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    // KOMENDA KONKURS (Na kanale + wysyłka na PW z przyciskiem zgłoszenia)
    if (message.content.startsWith('!konkurs')) {
        const tresc = message.content.slice(8).trim();
        if (!tresc) return message.reply("❌ Podaj treść konkursu! Przykład: `!konkurs Do wygrania darmowy skrypt! Zasady: ...`");

        // 1. Wysłanie informacji o konkursie na kanał
        const channelEmbed = new EmbedBuilder()
            .setAuthor({ name: "Oficjalny Konkurs • DarkCode", iconURL: message.guild.iconURL() })
            .setTitle("🎁 NOWY KONKURS NA SERWERZE!")
            .setDescription(tresc)
            .setColor(0xE91E63)
            .setImage(GRAFIKA_BANNER || null)
            .setFooter({ text: "DarkCode • Powiadomienie konkursowe", iconURL: message.guild.iconURL() })
            .setTimestamp();

        await message.channel.send({ embeds: [channelEmbed] });

        // 2. Rozsyłanie na PW z przyciskiem wzięcia udziału
        await message.reply("⏳ Wysyłam również informację o konkursie na PW do zweryfikowanych graczy z przyciskiem zgłoszenia...");

        await message.guild.members.fetch();
        const verifiedRole = message.guild.roles.cache.find(r => r.name === ROLE_ZWERYFIKOWANY);

        if (!verifiedRole) {
            return message.channel.send("❌ Nie znaleziono roli `DarkCode-użytkownik` na serwerze!");
        }

        let wyslane = 0;
        let bledy = 0;

        const dmEmbed = new EmbedBuilder()
            .setAuthor({ name: "Konkurs • DarkCode", iconURL: message.guild.iconURL() })
            .setTitle("🎁 SPECJALNY KONKURS DLA CIEBIE!")
            .setDescription(tresc + "\n\n> *Kliknij poniższy przycisk, aby wziąć udział w konkursie!*")
            .setColor(0xE91E63)
            .setImage(GRAFIKA_BANNER || null)
            .setFooter({ text: "Powodzenia!", iconURL: message.guild.iconURL() })
            .setTimestamp();

        const dmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('join_contest')
                .setLabel('Weź udział')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎉')
        );

        for (const member of verifiedRole.members.values()) {
            if (member.user.bot) continue;
            try {
                await member.send({ embeds: [dmEmbed], components: [dmRow] });
                wyslane++;
            } catch (err) {
                bledy++; // Użytkownik ma zablokowane PW
            }
        }

        await message.channel.send(`✅ Konkurs ogłoszony na kanale i rozesłany na PW!\n📊 Zgłoszenia wysłane do: **${wyslane}** | Zablokowane PW: **${bledy}**`);
        message.delete().catch(() => {});
    }

    // OGŁOSZENIE (Na kanale + wysyłka na PW z przyciskiem "Przeczytane")
    if (message.content.startsWith('!ogloszenie')) {
        const tresc = message.content.slice(12).trim();
        if (!tresc) return message.reply("❌ Podaj treść ogłoszenia!");

        const channelEmbed = new EmbedBuilder()
            .setAuthor({ name: "Oficjalne Ogłoszenie • DarkCode", iconURL: message.guild.iconURL() })
            .setTitle("📢 WAŻNY KOMUNIKAT SERWEROWY")
            .setDescription(tresc)
            .setColor(0xFEE75C)
            .setImage(GRAFIKA_BANNER || null)
            .setFooter({ text: "DarkCode • Powiadomienie ogólne", iconURL: message.guild.iconURL() })
            .setTimestamp();

        await message.channel.send({ embeds: [channelEmbed] });

        await message.reply("⏳ Wysyłam również ogłoszenie na PW do wszystkich zweryfikowanych graczy z przyciskiem przeczytania...");

        await message.guild.members.fetch();
        const verifiedRole = message.guild.roles.cache.find(r => r.name === ROLE_ZWERYFIKOWANY);

        if (!verifiedRole) {
            return message.channel.send("❌ Nie znaleziono roli `DarkCode-użytkownik` na serwerze!");
        }

        let wyslane = 0;
        let bledy = 0;

        const dmEmbed = new EmbedBuilder()
            .setAuthor({ name: "Prywata Wiadomość • DarkCode", iconURL: message.guild.iconURL() })
            .setTitle("📫 NOWE OGŁOSZENIE Z SERWERA")
            .setDescription(tresc + "\n\n> *Kliknij poniższy przycisk, aby potwierdzić przeczytanie wiadomości.*")
            .setColor(0xFEE75C)
            .setImage(GRAFIKA_BANNER || null)
            .setFooter({ text: "Dziękujemy, że jesteś z nami!", iconURL: message.guild.iconURL() })
            .setTimestamp();

        const dmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('mark_as_read')
                .setLabel('Przeczytane')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
        );

        for (const member of verifiedRole.members.values()) {
            if (member.user.bot) continue;
            try {
                await member.send({ embeds: [dmEmbed], components: [dmRow] });
                wyslane++;
            } catch (err) {
                bledy++;
            }
        }

        await message.channel.send(`✅ Ogłoszenie opublikowane na kanale oraz rozesłane na PW!\n📊 Dostarczono: **${wyslane}** | Zablokowane PW: **${bledy}**`);
        message.delete().catch(() => {});
    }

    // UNIWERSALNA WIADOMOŚĆ
    if (message.content.startsWith('!wiadomosc')) {
        const tresc = message.content.slice(10).trim();
        if (!tresc) return message.reply("❌ Podaj treść wiadomości!");

        const embed = new EmbedBuilder()
            .setAuthor({ name: "DarkCode Informacje", iconURL: message.guild.iconURL() })
            .setTitle("💬 KOMUNIKAT ADMINISTRACJI")
            .setDescription(tresc)
            .setColor(0x3498DB)
            .setImage(GRAFIKA_BANNER || null)
            .setFooter({ text: "DarkCode • System Informacyjny", iconURL: message.guild.iconURL() })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
        message.delete().catch(() => {});
    }

    // CENNIK
    if (message.content.startsWith('!cennik')) {
        const tresc = message.content.slice(8).trim();
        if (!tresc) return message.reply("❌ Podaj treść cennika!");

        const embed = new EmbedBuilder()
            .setAuthor({ name: "DarkCode Oferta & Usługi", iconURL: message.guild.iconURL() })
            .setTitle("💎 OFICJALNY CENNIK USŁUG")
            .setDescription(tresc)
            .setColor(0x2ECC71)
            .setImage(GRAFIKA_BANNER || null)
            .setFooter({ text: "Masz pytania? Otwórz ticket!", iconURL: message.guild.iconURL() })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
        message.delete().catch(() => {});
    }

    // PANEL WERYFIKACJI
    if (message.content === '!weryfikacja') {
        const embed = new EmbedBuilder()
            .setAuthor({ name: "DarkCode Security", iconURL: message.guild.iconURL() })
            .setTitle("🔒 SYSTEM WERYFIKACJI")
            .setDescription("Witamy na **DarkCode**! Aby uzyskać pełny dostęp do kanałów, musimy upewnić się, że nie jesteś robotem.\n\n> 💡 Kliknij zielony przycisk poniżej i rozwiąż prosty przykład matematyczny.")
            .setColor(0x2ECC71)
            .setImage(GRAFIKA_BANNER || null)
            .setFooter({ text: "Zabezpieczenie serwera Minecraft", iconURL: message.guild.iconURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('start_verification').setLabel('Zweryfikuj się').setStyle(ButtonStyle.Success).setEmoji('✅')
        );

        const channel = message.guild.channels.cache.get(KANAL_WERYFIKACJA) || message.channel;
        channel.send({ embeds: [embed], components: [row] });
        message.delete().catch(() => {});
    }

    // PANEL REKRUTACJI
    if (message.content === '!rekrutacja') {
        const embed = new EmbedBuilder()
            .setAuthor({ name: "DarkCode Kariera", iconURL: message.guild.iconURL() })
            .setTitle("👷 REKRUTACJA DO ZESPOŁU")
            .setDescription("Marzy Ci się praca przy rozwoju serwera lub tworzeniu skryptów? Wybierz interesujące Cię stanowisko z menu poniżej i wypełnij krótki formularz zgłoszeniowy!\n\n> 🛡️ **Helper** • Pomoc w moderacji\n> 💻 **Developer** • Tworzenie autorskich skryptów\n> 🎨 **Grafik** • Oprawa wizualna i bannery")
            .setColor(0x5865F2)
            .setImage(GRAFIKA_BANNER || null)
            .setFooter({ text: "Rekrutacja otwarta dla wszystkich", iconURL: message.guild.iconURL() });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('recruitment_select_role')
                .setPlaceholder('🎯 Wybierz stanowisko, na które aplikujesz...')
                .addOptions([
                    { label: 'Helper / Moderacja', value: 'helper', description: 'Pilnowanie porządku na czacie i serwerze', emoji: '🛡️' },
                    { label: 'Developer / Skrypter', value: 'dev', description: 'Pisanie zaawansowanych skryptów i systemów', emoji: '💻' },
                    { label: 'Grafik', value: 'gfx', description: 'Projektowanie grafik, miniatur i bannerów', emoji: '🎨' }
                ])
        );

        const channel = message.guild.channels.cache.get(KANAL_REKRUTACJA) || message.channel;
        channel.send({ embeds: [embed], components: [row] });
        message.delete().catch(() => {});
    }

    // PANEL TICKETÓW
    if (message.content === '!ticket') {
        const embed = new EmbedBuilder()
            .setAuthor({ name: "DarkCode Support", iconURL: message.guild.iconURL() })
            .setTitle("🎫 SYSTEM WSPARCIA I TICKETÓW")
            .setDescription("Potrzebujesz pomocy administracji, masz problem ze skryptem lub chcesz skorzystać z płatnych usług? Wybierz kategorię poniżej, aby utworzyć prywatny kanał.\n\n> 🛠️ **Pomoc techniczna** • Błędy, skrypty, problemy\n> 💳 **Zakupy / Usługi** • Pytania o rangi i płatności\n> ❓ **Inne sprawy** • Pozostałe zapytania")
            .setColor(0xFEE75C)
            .setImage(GRAFIKA_BANNER || null)
            .setFooter({ text: "Twój ticket będzie widoczny tylko dla Ciebie i ekipy", iconURL: message.guild.iconURL() });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_select_category')
                .setPlaceholder('📂 Wybierz kategorię zgłoszenia...')
                .addOptions([
                    { label: 'Pomoc techniczna / Skrypty', value: 'tech', description: 'Problemy z działaniem skryptów lub kodu', emoji: '🛠️' },
                    { label: 'Zakup rangi / Usługi', value: 'buy', description: 'Sprawy związane z płatnościami i rangami', emoji: '💳' },
                    { label: 'Skarga / Pytanie ogólne', value: 'other', description: 'Pozostałe kwestie administracyjne', emoji: '❓' }
                ])
        );

        const channel = message.guild.channels.cache.get(KANAL_TICKET) || message.channel;
        channel.send({ embeds: [embed], components: [row] });
        message.delete().catch(() => {});
    }
});

// 3. Obsługa interakcji (przyciski, modale, menu)
client.on('interactionCreate', async interaction => {
    // --- POTWIERDZENIE PRZECZYTANE NA PW ---
    if (interaction.isButton() && interaction.customId === 'mark_as_read') {
        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('mark_as_read')
                .setLabel('Przeczytane (Potwierdzono)')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('✔️')
                .setDisabled(true)
        );

        await interaction.update({ 
            content: "✅ **Dziękujemy!** Oznaczono ogłoszenie jako przeczytane.", 
            components: [disabledRow] 
        });
        return;
    }

    // --- WZIĘCIE UDZIAŁU W KONKURSIE NA PW ---
    if (interaction.isButton() && interaction.customId === 'join_contest') {
        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('join_contest')
                .setLabel('Wzięto udział (Zgłoszono)')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🎉')
                .setDisabled(true)
        );

        await interaction.update({ 
            content: "🎉 **Gratulacje!** Twoje zgłoszenie do konkursu zostało przyjęte. Trzymamy kciuki!", 
            components: [disabledRow] 
        });
        return;
    }

    // --- WERYFIKACJA ---
    if (interaction.isButton() && interaction.customId === 'start_verification') {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const wynik = num1 + num2;

        const modal = new ModalBuilder().setCustomId(`verify_modal_${wynik}`).setTitle('Weryfikacja matematyczna');
        const mathInput = new TextInputBuilder().setCustomId('math_answer').setLabel(`Wynik działania: ${num1} + ${num2} = ?`).setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(mathInput));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('verify_modal_')) {
        const expectedResult = interaction.customId.split('_')[2];
        const userAnswer = interaction.fields.getTextInputValue('math_answer');

        if (userAnswer === expectedResult) {
            const unverifiedRole = interaction.guild.roles.cache.find(r => r.name === ROLE_NIEZWERYFIKOWANY);
            const verifiedRole = interaction.guild.roles.cache.find(r => r.name === ROLE_ZWERYFIKOWANY);

            try {
                if (unverifiedRole && interaction.member.roles.cache.has(unverifiedRole.id)) await interaction.member.roles.remove(unverifiedRole);
                if (verifiedRole) await interaction.member.roles.add(verifiedRole);
                await interaction.reply({ content: "✅ **Sukces!** Prawidłowa odpowiedź. Otrzymałeś pełny dostęp do serwera!", ephemeral: true });
            } catch (err) {
                await interaction.reply({ content: "❌ Błąd podczas nadawania ról. Sprawdź pozycję roli bota w ustawieniach serwera!", ephemeral: true });
            }
        } else {
            await interaction.reply({ content: "❌ **Błędna odpowiedź!** Kliknij przycisk weryfikacji ponownie i spróbuj jeszcze raz.", ephemeral: true });
        }
    }

    // --- REKRUTACJA ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'recruitment_select_role') {
        const roleType = interaction.values[0];
        const roleNames = { helper: 'Helper', dev: 'Developer', gfx: 'Grafik' };

        const modal = new ModalBuilder().setCustomId(`rec_modal_${roleType}`).setTitle(`Podanie: ${roleNames[roleType]}`);
        
        const q1 = new TextInputBuilder().setCustomId('rec_age').setLabel('1. Ile masz lat?').setStyle(TextInputStyle.Short).setRequired(true);
        const q2 = new TextInputBuilder().setCustomId('rec_exp').setLabel('2. Jakie masz doświadczenie?').setStyle(TextInputStyle.Paragraph).setRequired(true);
        const q3 = new TextInputBuilder().setCustomId('rec_why').setLabel('3. Dlaczego chcesz dołączyć do DarkCode?').setStyle(TextInputStyle.Paragraph).setRequired(true);
        const q4 = new TextInputBuilder().setCustomId('rec_time').setLabel('4. Ile czasu możesz poświęcić?').setStyle(TextInputStyle.Short).setRequired(true);
        const q5 = new TextInputBuilder().setCustomId('rec_mic').setLabel('5. Czy masz sprawny mikrofon?').setStyle(TextInputStyle.Short).setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(q1),
            new ActionRowBuilder().addComponents(q2),
            new ActionRowBuilder().addComponents(q3),
            new ActionRowBuilder().addComponents(q4),
            new ActionRowBuilder().addComponents(q5)
        );

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('rec_modal_')) {
        const roleType = interaction.customId.split('_')[2];
        const roleNames = { helper: 'Helper', dev: 'Developer', gfx: 'Grafik' };

        const age = interaction.fields.getTextInputValue('rec_age');
        const exp = interaction.fields.getTextInputValue('rec_exp');
        const why = interaction.fields.getTextInputValue('rec_why');
        const time = interaction.fields.getTextInputValue('rec_time');
        const mic = interaction.fields.getTextInputValue('rec_mic');

        await interaction.reply({ content: "⏳ Przetwarzanie i tworzenie Twojego kanału rekrutacyjnego...", ephemeral: true });

        const channelName = `podanie-${interaction.user.username}`.toLowerCase();
        const recruitChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                { id: interaction.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
            ]
        });

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Kandydat: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle(`👷 Podanie rekrutacyjne — ${roleNames[roleType]}`)
            .addFields(
                { name: '🎯 Wybrane stanowisko', value: `\`${roleNames[roleType]}\``, inline: true },
                { name: '🎂 Wiek', value: `\`${age}\``, inline: true },
                { name: '🎙️ Mikrofon', value: `\`${mic}\``, inline: true },
                { name: '⏱️ Dostępny czas', value: `\`${time}\``, inline: false },
                { name: '💼 Doświadczenie', value: exp, inline: false },
                { name: '💡 Dlaczego my?', value: why, inline: false }
            )
            .setColor(0x5865F2)
            .setImage(GRAFIKA_BANNER || null)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('recruit_accept').setLabel('Zdał').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('recruit_reject').setLabel('Nie zdał').setStyle(ButtonStyle.Danger).setEmoji('❌')
        );

        await recruitChannel.send({ content: `Witaj ${interaction.user}! Oto Twoje podanie. Administracja wkrótce je rozpatrzy.`, embeds: [embed], components: [row] });
        await interaction.editReply({ content: `✅ Podanie zostało pomyślnie wysłane! Twój prywatny kanał: ${recruitChannel}` });
    }

    if (interaction.isButton() && (interaction.customId === 'recruit_accept' || interaction.customId === 'recruit_reject')) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ Brak uprawnień do oceny podania!", ephemeral: true });
        }

        const isAccepted = interaction.customId === 'recruit_accept';
        const channel = interaction.channel;
        const messages = await channel.messages.fetch({ limit: 10 });
        const targetMessage = messages.find(m => m.embeds.length > 0 && m.embeds[0].title.includes('Podanie rekrutacyjne'));
        
        let applicantUser = "Nieznany";
        if (targetMessage && targetMessage.embeds[0].author) {
            applicantUser = targetMessage.embeds[0].author.name.replace('Kandydat: ', '');
        }

        const wynikChannel = interaction.guild.channels.cache.get(KANAL_WYNIKI);
        if (wynikChannel) {
            const resultEmbed = new EmbedBuilder()
                .setAuthor({ name: "Wynik Rekrutacji • DarkCode", iconURL: interaction.guild.iconURL() })
                .setTitle(isAccepted ? "🎉 STATUS PODANIA: ZDANO" : "❌ STATUS PODANIA: NIE ZDANO")
                .setDescription(`Kandydat: **${applicantUser}**\nOceniający: ${interaction.user}`)
                .setColor(isAccepted ? 0x2ECC71 : 0xE74C3C)
                .setImage(GRAFIKA_BANNER || null)
                .setTimestamp();
            await wynikChannel.send({ embeds: [resultEmbed] });
        }

        await interaction.reply({ content: `📤 Wysłano wynik na kanał wyników. Kanał zostanie usunięty za chwilę...`, ephemeral: true });
        setTimeout(() => channel.delete().catch(() => {}), 4000);
    }

    // --- TICKETY ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select_category') {
        const categoryType = interaction.values[0];
        const categoryNames = { tech: 'Pomoc Techniczna', buy: 'Zakupy i Usługi', other: 'Inne sprawy' };

        const ticketChannelName = `ticket-${interaction.user.username}`.toLowerCase();
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === ticketChannelName);
        if (existingChannel) {
            return interaction.reply({ content: `❌ Posiadasz już otwarty ticket: ${existingChannel}`, ephemeral: true });
        }

        const ticketRole = interaction.guild.roles.cache.find(r => r.name === ROLE_TICKET);
        const overwrites = [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: interaction.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
        ];

        if (ticketRole) {
            overwrites.push({ id: ticketRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] });
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: ticketChannelName,
            type: ChannelType.GuildText,
            permissionOverwrites: overwrites
        });

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Ticket • ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle(`🎫 ${categoryNames[categoryType]}`)
            .setDescription(`Witaj ${interaction.user}!\nOpisz dokładnie swój problem lub sprawę. Ekipa **DarkCode** została powiadomiona i wkrótce udzieli Ci odpowiedzi.`)
            .setColor(0xFEE75C)
            .setImage(GRAFIKA_BANNER || null)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_claim').setLabel('Przejmij').setStyle(ButtonStyle.Primary).setEmoji('👤'),
            new ButtonBuilder().setCustomId('ticket_close').setLabel('Zamknij').setStyle(ButtonStyle.Danger).setEmoji('✖️')
        );

        await ticketChannel.send({ content: `${interaction.user} ${ticketRole ? `<@&${ticketRole.id}>` : ''}`, embeds: [embed], components: [row] });
        await interaction.reply({ content: `✅ Utworzono prywatny ticket: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'ticket_claim') {
        const hasAccess = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || 
                          (ROLE_TICKET && interaction.member.roles.cache.some(r => r.name === ROLE_TICKET));

        if (!hasAccess) return interaction.reply({ content: "❌ Brak uprawnień do przejęcia tego ticketu!", ephemeral: true });

        await interaction.reply({ content: `👤 **Ticket został przejęty przez:** ${interaction.user}` });
    }

    if (interaction.isButton() && interaction.customId === 'ticket_close') {
        const hasAccess = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || 
                          (ROLE_TICKET && interaction.member.roles.cache.some(r => r.name === ROLE_TICKET));

        if (!hasAccess) return interaction.reply({ content: "❌ Brak uprawnień!", ephemeral: true });

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_confirm_delete').setLabel('Tak, zamknij i usuń').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ticket_cancel_delete').setLabel('Anuluj').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ content: "⚠️ **Czy na pewno chcesz bezpowrotnie zamknąć ten ticket?**", components: [confirmRow] });
    }

    if (interaction.isButton() && interaction.customId === 'ticket_confirm_delete') {
        await interaction.reply({ content: "🔒 Zamykanie i usuwanie kanału ticketu..." });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }

    if (interaction.isButton() && interaction.customId === 'ticket_cancel_delete') {
        await interaction.message.delete().catch(() => {});
    }
});

client.login(process.env.DISCORD_TOKEN);
const http = require('http');

// Tworzymy prosty serwer HTTP, który odpowiada na każde zapytanie i spełnia wymagania Render.com
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is alive and running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serwer HTTP działa na porcie ${PORT}`);
});
