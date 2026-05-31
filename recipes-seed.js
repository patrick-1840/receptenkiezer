// Standaard recepten om de kennisbank te vullen bij eerste opstart
const SEED_RECIPES = [
  {
    id: 1001,
    name: "Vegetarische Romige Lasagne",
    cuisine: ["Italiaans"],
    prepTime: 45,
    seasons: ["Lente", "Zomer", "Herfst", "Winter"],
    ingredients: [
      "250g lasagnebladen",
      "2 blikken tomatenblokjes",
      "1 courgette",
      "1 rode paprika",
      "150g geraspte kaas",
      "1 ui",
      "2 teentjes knoflook",
      "500ml melk",
      "50g boter",
      "50g bloem",
      "2 el Italiaanse kruiden"
    ],
    instructions: "1. Snipper de ui en hak de knoflook fijn. Fruit deze aan in een pan met olie.\n2. Snijd de paprika en courgette in blokjes en bak deze 5 minuten mee.\n3. Voeg de tomatenblokjes en Italiaanse kruiden toe. Laat de saus 10 minuten zachtjes pruttelen.\n4. Maak ondertussen de bechamelsaus: smelt de boter in een pannetje, voeg de bloem toe en roer 1 minuut door (roux). Voeg beetje bij beetje de melk toe terwijl je stevig roert tot een gladde, gebonden saus ontstaat. Breng op smaak met zout, peper en eventueel een snufje nootmuskaat.\n5. Vet een ovenschaal in. Bouw de lasagne op: begin met een dun laagje tomatensaus, dan lasagnebladen, dan tomatensaus en een beetje bechamelsaus. Herhaal dit tot de ingrediënten op zijn. Eindig met een laag bechamelsaus en strooi de geraspte kaas erover.\n6. Bak de lasagne ongeveer 30 minuten in een voorverwarmde oven op 200°C tot de kaas goudbruin is.",
    vegAdjustment: "Dit recept is van nature al volledig vegetarisch!",
    pickyAdjustment: "Moeilijke eter aanpassing: Snijd de courgette en paprika extreem fijn of pureer de tomatensaus met een staafmixer voordat je de lasagne opbouwt. Zo zijn er geen 'stukjes' groente zichtbaar.",
    notes: "Altijd een succes bij kinderen als de saus glad gepureerd is. Restjes kunnen de volgende dag prima als lunch opgewarmd worden."
  },
  {
    id: 1002,
    name: "Kip Tandoori met Basmatirijst",
    cuisine: ["Aziatisch"],
    prepTime: 30,
    seasons: ["Lente", "Herfst", "Winter"],
    ingredients: [
      "400g kipfilet",
      "300g basmatirijst",
      "1 pot tandoori saus of pasta",
      "1 rode paprika",
      "1 ui",
      "150ml crème fraîche",
      "1 komkommer",
      "2 el zonnebloemolie"
    ],
    instructions: "1. Kook de basmatirijst volgens de aanwijzingen op de verpakking.\n2. Snijd de kipfilet in blokjes. Snijd de ui in halve ringen en de paprika in blokjes.\n3. Verhit de olie in een koekenpan of wok en bak de kipfilet rondom bruin.\n4. Voeg de ui en paprika toe en bak deze 5 minuten mee.\n5. Voeg de tandoorisaus en crème fraîche toe. Roer goed door en laat het geheel op laag vuur ongeveer 10 minuten zachtjes stoven.\n6. Snijd de komkommer in plakjes voor erbij.\n7. Serveer de tandoori kip samen met de warme rijst en de frisse komkommer.",
    vegAdjustment: "Vegetariër aanpassing: Bak voor de vegetariër in een apart pannetje vegetarische kipstuckjes of tofu-blokjes en meng dit met een deel van de tandoorisaus en crème fraîche.",
    pickyAdjustment: "Moeilijke eter aanpassing: Houd wat kipfiletblokjes apart en bak deze naturel (zonder saus) voor de moeilijke eter. Serveer de paprika apart of laat deze weg op het bord. Komkommer apart serveren.",
    notes: "De crème fraîche maakt de tandoorisaus heerlijk mild en romig, perfect voor kinderen."
  },
  {
    id: 1003,
    name: "Zomerse Pastasalade met Pesto",
    cuisine: ["Italiaans"],
    prepTime: 20,
    seasons: ["Lente", "Zomer"],
    ingredients: [
      "300g penne pasta",
      "150g cherrytomaten",
      "1 bol mozzarella",
      "100g pesto genovese",
      "50g rucola",
      "100g gerookte kipreepjes",
      "1 komkommer",
      "2 el pijnboompitten"
    ],
    instructions: "1. Kook de penne pasta beetgaar in ruim gezouten water. Giet af en spoel direct met koud water af om het kookproces te stoppen.\n2. Rooster de pijnboompitten in een droge koekenpan goudbruin en laat afkoelen op een bord.\n3. Halveer de cherrytomaatjes. Snijd de mozzarella en de komkommer in blokjes.\n4. Meng de afgekoelde pasta in een grote schaal met de groene pesto.\n5. Schep de tomaatjes, mozzarella, komkommer en rucola erdoorheen.\n6. Voeg de gerookte kipreepjes en de geroosterde pijnboompitten toe en schep nogmaals voorzichtig om.",
    vegAdjustment: "Vegetariër aanpassing: Schep een portie pastasalade uit vóórdat je de gerookte kipreepjes toevoegt, of vervang de gerookte kip voor de vegetariër door vegetarische spekjes of extra pijnboompitten.",
    pickyAdjustment: "Moeilijke eter aanpassing: Houd een portie penne apart. Serveer deze met alleen een beetje pesto en mozzarella (zonder tomaat, rucola en gerookte kip). Zo heeft de moeilijke eter een simpele, lekkere pesto-pasta.",
    notes: "Ideaal om van tevoren te maken voor warme zomerdagen of een picknick. Pijnboompitten pas vlak voor het serveren toevoegen om ze knapperig te houden."
  },
  {
    id: 1004,
    name: "Klassieke Boerenkoolstamppot",
    cuisine: ["Hollands"],
    prepTime: 35,
    seasons: ["Herfst", "Winter"],
    ingredients: [
      "1kg kruimige aardappelen",
      "500g gesneden boerenkool",
      "1 rookworst (gelderse of vegetarische)",
      "150g spekreepjes",
      "50g boter",
      "100ml melk",
      "1 el azijn",
      "zout en peper naar smaak"
    ],
    instructions: "1. Schil de aardappelen en snijd ze in gelijke stukken. Leg ze onderin een grote kookpan.\n2. Leg de boerenkool bovenop de aardappelen. Voeg een laagje water toe (zodat de aardappelen net onderstaan) en een snufje zout.\n3. Breng aan de kook en laat het geheel met de deksel op de pan in ca. 25 minuten gaar koken. Leg de laatste 15 minuten de rookworst bovenop de boerenkool om op te warmen.\n4. Bak ondertussen de spekreepjes in een droge koekenpan knapperig uit.\n5. Haal de rookworst uit de pan en snijd in plakjes. Giet de aardappelen en boerenkool af, maar vang een beetje kookvocht op.\n6. Stamp de aardappelen en boerenkool fijn met de stamper. Voeg de boter en melk (en eventueel wat kookvocht) toe om het smeuïg te maken.\n7. Schep de spekjes en een scheutje azijn door de stamppot. Breng op smaak met peper en zout.\n8. Serveer de stamppot met de plakjes rookworst.",
    vegAdjustment: "Vegetariër aanpassing: Gebruik een vegetarische rookworst (apart verwarmd) en bak vegetarische spekjes uit of laat de spekjes weg uit de stamppot en serveer ze apart in een bakje.",
    pickyAdjustment: "Moeilijke eter aanpassing: Zorg dat de stamppot goed smeuïg is gestampt zonder grote klontjes. Serveer de worst en spekjes apart op het bord in plaats van door de stamppot gemengd, zodat ze los gegeten kunnen worden.",
    notes: "Lekker met een kuiltje jus!"
  },
  {
    id: 1005,
    name: "Kleurrijke Mexicaanse Taco's",
    cuisine: ["Mexicaans"],
    prepTime: 25,
    seasons: ["Lente", "Zomer", "Herfst", "Winter"],
    ingredients: [
      "8 taco schelpen",
      "300g rundergehakt",
      "1 zakje taco kruiden",
      "1 blik maïs (ca. 150g)",
      "1 blik kidneybonen (ca. 200g)",
      "1 krop ijsbergsla",
      "150g geraspte cheddar of jonge kaas",
      "1 pot milde tomatensalsa"
    ],
    instructions: "1. Verhit een koekenpan en rul het gehakt hierin bruin. Giet overtollig vet af.\n2. Voeg de tacokruiden en het water (volgens de verpakking) toe. Laat ca. 5 minuten pruttelen op laag vuur.\n3. Spoel de kidneybonen en maïs af en warm deze kort mee op met het gehakt (of serveer ze apart).\n4. Snijd de ijsbergsla in dunne reepjes.\n5. Verwarm de taco schelpen ca. 5 minuten in een voorverwarmde oven op 180°C.\n6. Zet alle losse ingrediënten (warm gehaktmengsel, sla, kaas, maïs, bonen en salsa) in aparte bakjes op tafel.\n7. Ieder gezinslid kan nu zijn eigen taco vullen naar smaak.",
    vegAdjustment: "Vegetariër aanpassing: Vervang het rundergehakt door vegetarisch gehakt en bereid dit met dezelfde tacokruiden, óf maak een rijke bonenvulling van kidneybonen, zwarte bonen en maïs als hoofdvulling.",
    pickyAdjustment: "Moeilijke eter aanpassing: Omdat alle ingrediënten in aparte bakjes op tafel staan, kan de moeilijke eter zijn eigen taco 'samenstellen'. Vaak is een taco met alleen gehakt en geraspte kaas al voldoende en erg lekker!",
    notes: "Een gezellige en interactieve maaltijd waarbij niemand klaagt over ingrediënten die ze niet lusten, omdat ze deze simpelweg niet op hun taco scheppen!"
  }
];

// Exporteren voor gebruik in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEED_RECIPES;
}
