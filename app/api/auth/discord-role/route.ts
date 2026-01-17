import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { accessToken } = await req.json();
        const guildId = process.env.DISCORD_GUILD_ID;
        const roleId = process.env.DISCORD_ADMIN_ROLE_ID;

        if (!guildId || !roleId) {
            return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
        }

        // Fetch Guild Member details from Discord
        const discordRes = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!discordRes.ok) {
            console.error("Discord API Error:", await discordRes.text());
            return NextResponse.json({ error: 'Failed to fetch Discord membership' }, { status: 401 });
        }

        const memberData = await discordRes.json();
        const roles = memberData.roles || [];

        // Check if user has the specific role
        const hasRole = roles.includes(roleId);

        if (hasRole) {
            return NextResponse.json({ authorized: true });
        } else {
            return NextResponse.json({ authorized: false, error: 'Missing required Admin Role' }, { status: 403 });
        }

    } catch (error) {
        console.error("Role Verification Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
