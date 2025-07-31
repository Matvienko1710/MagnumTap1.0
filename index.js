import { Telegraf } from 'telegraf';
import { getUser, updateUser } from './db.js';

const bot = new Telegraf(process.env.BOT_TOKEN); // <-- замени на свой токен

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN must be provided!");
}

bot.start((ctx) => {
  ctx.reply('👋 Добро пожаловать! Жми кнопки: Фарм, Бонус или Профиль.', {
    reply_markup: {
      keyboard: [['👨‍🌾 Фарм', '🎁 Бонус'], ['📊 Профиль']],
      resize_keyboard: true,
    },
  });
});

bot.hears('👨‍🌾 Фарм', (ctx) => {
  const user = getUser(ctx.from.id);
  const now = Date.now();

  if (now - user.last_farm < 60_000) {
    const left = Math.ceil((60_000 - (now - user.last_farm)) / 1000);
    return ctx.reply(`⏳ Подожди ${left} сек. до следующего фарма`);
  }

  user.stars += 1;
  user.last_farm = now;
  updateUser(ctx.from.id, user);
  ctx.reply('⭐️ +1 звезда!');
});

bot.hears('🎁 Бонус', (ctx) => {
  const user = getUser(ctx.from.id);
  const now = Date.now();

  if (now - user.last_bonus < 3600_000) {
    const left = Math.ceil((3600_000 - (now - user.last_bonus)) / 60000);
    return ctx.reply(`🎁 Бонус можно через ${left} мин.`);
  }

  user.stars += 5;
  user.last_bonus = now;
  updateUser(ctx.from.id, user);
  ctx.reply('🎉 Ты получил +5 звёзд бонусом!');
});

bot.hears('📊 Профиль', (ctx) => {
  const user = getUser(ctx.from.id);
  ctx.reply(`👤 Профиль:\n\n⭐️ Звёзд: ${user.stars}`);
});

bot.launch();
