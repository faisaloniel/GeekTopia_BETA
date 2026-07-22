import {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder,
} from "discord.js";
import * as math from "mathjs";

function buildCalculatorRows(disabled = false) {
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("calculator_clear")
            .setLabel("AC")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_(")
            .setLabel("(")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_)")
            .setLabel(")")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_backspace")
            .setLabel("Backspace / Arrow")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled),
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("calculator_1")
            .setLabel("1")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_2")
            .setLabel("2")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_3")
            .setLabel("3")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_/")
            .setLabel("/")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled),
    );

    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("calculator_4")
            .setLabel("4")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_5")
            .setLabel("5")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_6")
            .setLabel("6")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_*")
            .setLabel("*")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled),
    );

    const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("calculator_7")
            .setLabel("7")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_8")
            .setLabel("8")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_9")
            .setLabel("9")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_-")
            .setLabel("-")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled),
    );

    const row5 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("calculator_0")
            .setLabel("0")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_.")
            .setLabel(".")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_equals")
            .setLabel("=")
            .setStyle(ButtonStyle.Success)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId("calculator_+")
            .setLabel("+")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled),
    );

    return [row1, row2, row3, row4, row5];
}

function buildEmbed(content) {
    return new EmbedBuilder()
        .setColor("Blue")
        .setDescription(`\`\`\`\n${content}\n\`\`\``);
}

function isOperator(value) {
    return ["+", "-", "*", "/", "."].includes(value);
}

export default {
    data: new SlashCommandBuilder()
        .setName("calculator")
        .setDescription("Interactive calculator"),

    async execute(interaction) {
        let data = "";

        const rows = buildCalculatorRows(false);

        await interaction.reply({
            embeds: [buildEmbed("Results will be displayed here")],
            components: rows,
        });

        const message = await interaction.fetchReply();

        const filter = (i) =>
            i.user.id === interaction.user.id &&
            i.customId.startsWith("calculator_");

        const collector = message.createMessageComponentCollector({
            filter,
            time: 600000,
        });

        collector.on("collect", async (i) => {
            const value = i.customId.split("_")[1];
            let displayText = data || "Results will be displayed here";

            if (value === "equals") {
                try {
                    const result = math.evaluate(data.toString());
                    data = String(result);
                    displayText = data;
                } catch (error) {
                    data = "";
                    displayText = "An error occurred please click on the AC for restart.";
                }
            } else if (value === "clear") {
                data = "";
                displayText = "Results will be displayed here";
            } else if (value === "backspace") {
                data = data.slice(0, -1);
                displayText = data || "Results will be displayed here";
            } else {
                const lastChar = data.slice(-1);

                if (isOperator(value) && (data.length === 0 || isOperator(lastChar) || lastChar === "(")) {
                    displayText = data || "Results will be displayed here";
                } else if (value === ")" && (data.length === 0 || isOperator(lastChar) || lastChar === "(")) {
                    displayText = data || "Results will be displayed here";
                } else if (value === "(" && data.length > 0 && !isOperator(lastChar) && lastChar !== "(") {
                    data += "*(";
                    displayText = data;
                } else {
                    data += value;
                    displayText = data;
                }
            }

            await i.update({
                embeds: [buildEmbed(displayText)],
                components: buildCalculatorRows(false),
            });
        });

        collector.on("end", async () => {
            await interaction.editReply({
                embeds: [buildEmbed(data || "Results will be displayed here")],
                components: buildCalculatorRows(true),
            }).catch(() => null);
        });
    },
};
