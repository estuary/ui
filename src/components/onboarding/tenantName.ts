const RESERVED_NAME_CONFUSABLES: [RegExp, string][] = [
    [/[ɑΑαАаᎪᗅ⍺ꓮꭤ𐊠𖽀𜳖𝽚𝽪]/gu, 'a'],
    [/[ΕЕеҽᎬ℮⋿ⴹꓰꗋꬲ𐊆𑢦𑢮𜳚𝾁]/gu, 'e'],
    [/[ƦɌгᎡᏒᖇᴦⲅꓣꭇꭈꮁ𐒴𖨙𖼵𜳧𝈖]/gu, 'r'],
    [/[ƽЅѕՏടႽჽᏕᏚᲽꓢꕶꜱꮪ𐊖𐐠𐑈𑣁𖫖𖼺𜳨]/gu, 's'],
    [/[ΤТߠᎢ⊤⟙Ⲧㄒ丅ꓔꔋ𐊗𐊱𐌕𑢼𖼊𜳩𝍳🝨]/gu, 't'],
    [/[ʋυՍսሀᑌᴜ∪⋃ꓴꞟꭎꭒ𐓎𐓶𑢸𑣘𖽂𜳪]/gu, 'u'],
    [/[ɣʏΥγУуҮүߌყᎩᎽᶌỿⲨⲩㄚ丫ꓬꭚ𐊲𐰠𑢤𑣄𑣜𖽃𜳮]/gu, 'y'],
];

const normalizeTenantName = (name: string) =>
    name
        .normalize('NFD')
        .replace(/\s/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');

export const validateTenantName = (name: string): true | string => {
    let skeleton = name.normalize('NFKD').replace(/\p{M}/gu, '');
    for (const [characters, replacement] of RESERVED_NAME_CONFUSABLES) {
        skeleton = skeleton.replace(characters, replacement);
    }

    if (
        /estuary/i.test(skeleton) ||
        /estuary/i.test(normalizeTenantName(name))
    ) {
        return 'Organization names cannot contain "estuary".';
    }

    return true;
};
