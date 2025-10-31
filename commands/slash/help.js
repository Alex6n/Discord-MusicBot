const SlashCommand = require("../../lib/SlashCommand");
const {
  Client,
  Interaction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} = require("discord.js");
const LoadCommands = require("../../util/loadCommands");
const { filter } = require("lodash");

const command = new SlashCommand()
  .setName("help")
  .setDescription("Shows this list")
  .setRun(async (client, interaction) => {
    await interaction.deferReply().catch((_) => {});

    // map the commands name and description to the embed
    const commands = await LoadCommands().then((cmds) => {
      return [].concat(cmds.slash) /*.concat(cmds.context)*/;
    });

    // from commands remove the ones that have "null" in the description
    const filteredCommands = commands.filter(
      (cmd) => cmd.description != "null"
    );

    // Categorize commands by relevance
    const categories = {
      "🎵 Essential Music": [
        "summon",
        "play",
        "nowplaying",
        "queue",
        "insert",
        "stop",
        "shuffle",
      ],
      "📝 Queue Management": [
        "previous",
        "pause",
        "resume",
        "skip",
        "clear",
        "remove",
        "move",
        "skipto",
      ],
      "🔁 Playback Control": ["loop", "loopq", "replay", "seek", "volume"],
      "🎛️ Settings": ["247", "autoqueue", "autopause", "autoleave", "filters"],
      "ℹ️ Information": ["help", "ping", "stats", "lyrics", "search", "save"],
      "⚙️ Administration": [
        "clean",
        "reload",
        "guildleave",
        "status",
        "restart",
      ],
      "🔗 Other": ["invite"],
    };

    // Sort commands by category
    const sortedCommands = [];

    // Add commands in category order
    for (const [categoryName, commandNames] of Object.entries(categories)) {
      for (const cmdName of commandNames) {
        const cmd = filteredCommands.find((c) => c.name === cmdName);
        if (cmd && !sortedCommands.includes(cmd)) {
          sortedCommands.push(cmd);
        }
      }
    }

    // Add any remaining commands not in categories
    filteredCommands.forEach((cmd) => {
      if (!sortedCommands.includes(cmd)) {
        sortedCommands.push(cmd);
      }
    });

    const totalCmds = sortedCommands.length;
    let maxPages = Math.ceil(totalCmds / client.config.helpCmdPerPage);

    // if git exists, then get commit hash
    let gitHash = "";
    try {
      gitHash = require("child_process")
        .execSync("git rev-parse --short HEAD")
        .toString()
        .trim();
    } catch (e) {
      // do nothing
      gitHash = "unknown";
    }

    // default Page No.
    let pageNo = 0;

    const helpEmbed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setAuthor({
        name: `Commands of ${client.user.username}`,
        iconURL: client.config.iconURL,
      })
      .setTimestamp()
      .setFooter({ text: `Page ${pageNo + 1} / ${maxPages}` });

    // Helper function to get category for a command
    const getCommandCategory = (cmdName) => {
      for (const [categoryName, commandNames] of Object.entries(categories)) {
        if (commandNames.includes(cmdName)) {
          return categoryName;
        }
      }
      return "🔗 Other";
    };

    // initial temporary array
    var tempArray = sortedCommands.slice(
      pageNo * client.config.helpCmdPerPage,
      pageNo * client.config.helpCmdPerPage + client.config.helpCmdPerPage
    );

    // Group by category for display
    let currentCategory = "";
    tempArray.forEach((cmd) => {
      const cmdCategory = getCommandCategory(cmd.name);
      if (cmdCategory !== currentCategory) {
        currentCategory = cmdCategory;
        // Add category header (but not as a field to avoid clutter)
      }
      helpEmbed.addFields({
        name: `/${cmd.name}`,
        value: `${cmd.description}`,
        inline: false,
      });
    });

    // Construction of the buttons for the embed
    const getButtons = (pageNo) => {
      return new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("help_cmd_but_2_app")
          .setEmoji("◀️")
          .setStyle("SECONDARY")
          .setDisabled(pageNo == 0),
        new MessageButton()
          .setCustomId("help_cmd_but_1_app")
          .setEmoji("▶️")
          .setStyle("SECONDARY")
          .setDisabled(pageNo == maxPages - 1)
      );
    };

    const tempMsg = await interaction.editReply({
      embeds: [helpEmbed],
      components: [getButtons(pageNo)],
      fetchReply: true,
    });
    const collector = tempMsg.createMessageComponentCollector({
      time: 600000,
      componentType: "BUTTON",
    });

    collector.on("collect", async (iter) => {
      if (iter.customId === "help_cmd_but_1_app") {
        pageNo++;
      } else if (iter.customId === "help_cmd_but_2_app") {
        pageNo--;
      }

      helpEmbed.fields = [];

      var tempArray = sortedCommands.slice(
        pageNo * client.config.helpCmdPerPage,
        pageNo * client.config.helpCmdPerPage + client.config.helpCmdPerPage
      );

      let currentCategory = "";
      tempArray.forEach((cmd) => {
        const cmdCategory = getCommandCategory(cmd.name);
        if (cmdCategory !== currentCategory) {
          currentCategory = cmdCategory;
        }
        helpEmbed
          .addFields({
            name: `/${cmd.name}`,
            value: `${cmd.description}`,
            inline: false,
          })
          .setFooter({ text: `Page ${pageNo + 1} / ${maxPages}` });
      });

      await iter.update({
        embeds: [helpEmbed],
        components: [getButtons(pageNo)],
        fetchReply: true,
      });
    });
  });

module.exports = command;
