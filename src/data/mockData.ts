import { Classroom, Facility, Workshop, Student, FAQItem, Testimonial, SchoolAnnouncement, UserProfileInfo } from '../types';

export const SCHOOL_IMAGES = {
  mayelinRealProfile: '/mayelin_real_profile.jpg',
  facebookAlbumUrl: 'https://www.facebook.com/profile.php?id=100069216559660&sk=photos',
  facebookPageUrl: 'https://www.facebook.com/profile.php?id=100069216559660',
  heroClassroom: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMjeRZaKG3CgqQtALfGqpFrkJ3Rc8VJa4-MvHgdoPDv6Kf4TxwtTPMycqRauiALp1ZCuJ4GW3wDhIS-1lPvQDl0_59M10cwuCZRpGFIZO-rdEN1ReroFjQfSU9UrqwK1zHwGfY_g29DVGvOgY78ug8rMHMEDjLFm3A5Wbs8WxbwiWSHMIp7WkmLdMb4gqYFdCrUMmnLy8k1VNeEdnsrmCUPUzsS1FBSY7ID87A2-6QnmwLvAcebm4S',
  garden: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIdJvSLYtF0Oqt0iLHnMqFj1yipkCP2FYa7b7IUl6_i1GMu1InOakhkwrO2Lhd1nYwQhUXvFOC7RhMN3x9MtxIeD7uZPMZbX05JBIJlftvTtY5EqjnjNVH7zS_-Lw-JcENDYVznek0_IsafzNmpsZR_wb0Oe5KiMyvFnkTinslEcvVSxfXEwjjZHTy2NIxdHky3hwFXFWKsTvRgqsbupOh9LcyhAA0zXa-60auGf-z-JoYFDZ2EdFA',
  napRoom: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCV_jYhwVHgVynwFZrbZHagGHfid-g0uxe5nyntvHyod5HPn9cfKu_35KnK7uAAsqlBH-1hvSawZScWv5eeLzPjSdcOkJ7oRCQar-8FdIWZ1l4A-7eUAxcrKqJwZRvsaVNfqqVdlFDkRl_kebOQTKckP58YI4MZc6_JSGXTsn7jDXwBsPxU4CUkIb2tpnLvzyyiFeQ839PnUdw6EIe7oCygtZT6AGYU_juFQBvkvRG-voV4-MGSdX6',
  cafeteria: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASULEuRQq68FFNZSastsViPEFlISfb1h-RzbT2sU1VP6NWn5sOl1rJa8zolUr-OrREMZTA7U6Xq3AFdak7XklrbVxFxVN1NJ1-F9PLBnOko3DkozlAByAYtVXgTTtWruBfXGQ6k2Kq0447j0XsmJshB0YTeCLkYB2Go59ZmI-brtuvTjlq6mhSC8ZThIHvhs7sGh4q66h4VPgyxMntDFZI_bcQ1wxAUHwF3iGp8EciSWMCHWiZ0N7h',
  gymPlayground: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQDTbbLHkhVKvz29B5j-RMMIKmGIZflGI-W4Fx4JyJCaNts5OgAN31aCK-IHXqTA3WAwuMJr8uNOXtiw1goSeu8NjtpgXs64oG0RQ21GIpLGvz3wjSQoXMN-Y4o3w2IwPqeb1O04ea2HWyhTP6sOnzdPVxkGCeJeyQSnWq5SQWa2bbQsu8XCZnxo0Rwuvn5IteDXYVpgyi-VVjFIoAw9dkNU5b5f-FQSey4nSewSTvOGWIsfdfKHjw',
  mapNeighborhood: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjBmGtCJYHH_ucl23StZkKsp-9xzHHPHXyOICe5czD_W-PqhytZMgWaRzQYXioAbPQtQtUcFFiciHFt616mjDh1EY1n6OYGq6_R4fPBsqSHH31FtgvVm1LlHXLpFzB5IqPvr9f1_IM57DatVJxIxy0lthzd25Uab9_n57Qzz5aWsFXNJGHqIlw3qv3Wutw9OBuSsgXLyVpq5cSTNI9AHMnVUdQ26NgpC3cN1fxi3OfROZbWzXPZgRc',
};

export const SCHOOL_CONTACT = {
  name: 'Jardim Escola da Mayelin',
  phoneDisplay: '+244 936 73 94 28',
  phoneClean: '244936739428',
  email: 'contacto@mayelinkids.com',
  address: 'Centralidade do Kilamba / Belas',
  city: 'Luanda, Angola',
  facebookUrl: 'https://www.facebook.com/profile.php?id=100069216559660&sk=photos',
  facebookFollowers: '215 curtidas • Pré-escola',
};

export const CLASSROOMS: Classroom[] = [
  {
    id: 'bercario',
    title: 'Berçário Encantado',
    ageRange: '4 meses a 1 ano',
    badge: 'Proporção 1:3',
    badgeColor: 'bg-pink-100 text-[#ed145b]',
    borderColor: 'border-t-[#ed145b]',
    accentColor: '#ed145b',
    description: 'Acolhimento sereno para os menores bebês, com rotina individualizada de sono, massagem Shantala e estímulo sensorial amoroso.',
    features: [
      'Lactário esterilizado e exclusivo',
      'Dormitório acústico climatizado com berços individuais',
      'Estímulo motor precoce e fisioterapia preventiva'
    ],
    shifts: ['Matutino', 'Vespertino', 'Integral (12h)']
  },
  {
    id: 'maternal',
    title: 'Maternal I & II',
    ageRange: '1 a 3 anos',
    badge: 'Descoberta Ativa',
    badgeColor: 'bg-amber-100 text-amber-900',
    borderColor: 'border-t-[#fd9924]',
    accentColor: '#fd9924',
    description: 'Explosão da fala, primeiros passos firmes, sociabilização com os coleguinhas e introdução ao desfralde gradual com paciência.',
    features: [
      'Estímulo intensivo à linguagem oral e musicalização',
      'Exploração sensorial, tintas naturais e texturas',
      'Banheiros adaptados em miniatura para autonomia'
    ],
    shifts: ['Matutino', 'Vespertino', 'Integral (12h)']
  },
  {
    id: 'jardim',
    title: 'Pré-Escola & Jardim',
    ageRange: '4 a 5 anos',
    badge: 'Pré-Letramento',
    badgeColor: 'bg-sky-100 text-sky-800',
    borderColor: 'border-t-[#00a6c0]',
    accentColor: '#00a6c0',
    description: 'Letramento lúdico, vivências em inglês, noções de raciocínio matemático, investigação da natureza e fortalecimento da autoconfiança.',
    features: [
      'Cantinho da Leitura e contação teatral de histórias',
      'Inglês lúdico com imersão diária e cantigas',
      'Projetos Maker e pequenas experiências científicas'
    ],
    shifts: ['Matutino', 'Vespertino', 'Integral (12h)']
  }
];

export const FACILITIES: Facility[] = [
  {
    id: 'horta',
    title: 'Horta Pedagógica & Pátio Sensorial',
    tag: 'Ao Ar Livre',
    tagColor: 'bg-emerald-500 text-white',
    image: SCHOOL_IMAGES.garden,
    alt: 'Crianças colhendo e regando a horta pedagógica sob luz matinal',
    description: 'Plantio de temperos, contato com a terra fértil e caminho descalço com pedrinhas, areia e cascas de árvores.'
  },
  {
    id: 'soninho',
    title: 'Sala do Soninho Aconchegante',
    tag: 'Aconchego',
    tagColor: 'bg-[#ed145b] text-white',
    image: SCHOOL_IMAGES.napRoom,
    alt: 'Dormitório acolhedor com luz dimerizada e berços confortáveis',
    description: 'Temperatura controlada, iluminação circadiana dimerizada e trilha sonora de acalanto para um descanso restaurador.'
  },
  {
    id: 'refeitorio',
    title: 'Refeitório & Cozinha Nutritiva',
    tag: 'Nutrição Pura',
    tagColor: 'bg-[#fd9924] text-white',
    image: SCHOOL_IMAGES.cafeteria,
    alt: 'Refeitório infantil colorido com frutas frescas e mesas adaptadas',
    description: 'Sem açúcar refinado e sem ultraprocessados. Cardápios customizados para celíacos, APLV e vegetarianos.'
  },
  {
    id: 'playground',
    title: 'Playground & Psicomotricidade',
    tag: 'Movimento',
    tagColor: 'bg-[#00a6c0] text-white',
    image: SCHOOL_IMAGES.gymPlayground,
    alt: 'Espaço psicomotor com blocos macios e pontes de equilíbrio',
    description: 'Circuitos de escalada suave, pontes de equilíbrio e brinquedos não estruturados que desafiam o corpo com segurança.'
  }
];

export const WORKSHOPS: Workshop[] = [
  {
    id: 'musica',
    title: 'Musicalização Infantil',
    description: 'Ritmo, percepção sonora e instrumentos táteis adaptados.',
    iconName: 'Music',
    bgClass: 'bg-pink-50/80 border-pink-200 text-[#ed145b]',
    textClass: 'bg-[#ed145b] text-white'
  },
  {
    id: 'psicomotricidade',
    title: 'Psicomotricidade Relacional',
    description: 'Controle motor corporal, equilíbrio e vínculo afetivo com os pares.',
    iconName: 'Activity',
    bgClass: 'bg-emerald-50/80 border-emerald-200 text-emerald-600',
    textClass: 'bg-emerald-500 text-white'
  },
  {
    id: 'artes',
    title: 'Ateliê de Artes Plásticas',
    description: 'Expressão livre, modelagem com argila natural e tintas atóxicas.',
    iconName: 'Palette',
    bgClass: 'bg-sky-50/80 border-sky-200 text-[#00a6c0]',
    textClass: 'bg-[#00a6c0] text-white'
  },
  {
    id: 'ingles',
    title: 'Vivências em Inglês',
    description: 'Brincadeiras e imersão natural no vocabulário com canções cotidianas.',
    iconName: 'Globe',
    bgClass: 'bg-amber-50/80 border-amber-200 text-[#fd9924]',
    textClass: 'bg-[#fd9924] text-white'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'lucas-mayelin',
    name: 'Lucas Mayelin',
    classroom: 'Maternal I',
    age: '2 anos e 3 meses',
    avatarLetter: 'L',
    status: 'Presente',
    responsibleName: 'Helena & Arthur Mayelin',
    teacherName: 'Tia Carol & Profa. Juliana',
    allergies: ['Não possui alergias registradas'],
    medications: ['Soro fisiológico 0.9% para higienização nasal se necessário'],
    dailyLogs: [
      {
        id: 'log-1',
        time: '08:15',
        title: 'Chegada Acolhedora',
        description: 'Entrou sorridente com a mochila do elefantinho, abraçou a professora e foi direto ao cantinho das almofadas.',
        category: 'activity',
        icon: 'Smile',
        colorClass: 'text-[#ed145b]',
        bgClass: 'bg-pink-100'
      },
      {
        id: 'log-2',
        time: '09:30',
        title: 'Lanchinho Matinal da Horta',
        description: 'Comeu melancia fresca cortadinha e bebeu água de coco natural. Repetiu duas fatias.',
        category: 'meal',
        icon: 'Utensils',
        colorClass: 'text-[#fd9924]',
        bgClass: 'bg-amber-100'
      },
      {
        id: 'log-3',
        time: '10:45',
        title: 'Oficina de Psicomotricidade & Horta',
        description: 'Participou da rega dos pezinhos de alecrim e completou o circuito de equilíbrio com muito entusiasmo.',
        category: 'activity',
        icon: 'Sparkles',
        colorClass: 'text-emerald-600',
        bgClass: 'bg-emerald-100'
      },
      {
        id: 'log-4',
        time: '11:45',
        title: 'Almoço Completo',
        description: 'Comeu toda a porção de legumes cozidos no vapor, arroz integral e purê de abóbora caseiro. Excelente apetite!',
        category: 'meal',
        icon: 'Utensils',
        colorClass: 'text-[#fd9924]',
        bgClass: 'bg-amber-100'
      },
      {
        id: 'log-5',
        time: '13:10',
        title: 'Soninho Restaurador da Tarde',
        description: 'Dormiu tranquilamente por 1h40 ouvindo canções de acalanto na sala climatizada.',
        category: 'nap',
        icon: 'Moon',
        colorClass: 'text-[#00a6c0]',
        bgClass: 'bg-sky-100'
      },
      {
        id: 'log-6',
        time: '15:20',
        title: '4 Novas Fotos no Álbum do Dia',
        description: 'Atividade sensorial com massinha caseira aromatizada com camomila.',
        category: 'activity',
        icon: 'Camera',
        colorClass: 'text-[#ed145b]',
        bgClass: 'bg-pink-100'
      }
    ],
    photos: [
      {
        id: 'photo-1',
        url: SCHOOL_IMAGES.heroClassroom,
        caption: 'Lucas concentrado na construção com blocos de madeira e os colegas',
        time: 'Hoje • 10:15'
      },
      {
        id: 'photo-2',
        url: SCHOOL_IMAGES.garden,
        caption: 'Cuidando das plantinhas na nossa Horta Pedagógica',
        time: 'Hoje • 10:40'
      },
      {
        id: 'photo-3',
        url: SCHOOL_IMAGES.cafeteria,
        caption: 'Hora do lanche saudável compartilhando frutas frescas',
        time: 'Hoje • 11:30'
      },
      {
        id: 'photo-4',
        url: SCHOOL_IMAGES.gymPlayground,
        caption: 'Circuito lúdico de equilíbrio e desenvolvimento motor',
        time: 'Hoje • 14:45'
      }
    ]
  },
  {
    id: 'helena-rocha',
    name: 'Helena Rocha',
    classroom: 'Berçário Encantado',
    age: '8 meses',
    avatarLetter: 'H',
    status: 'Soneca',
    responsibleName: 'Camila & Fernando Rocha',
    teacherName: 'Profa. Denise & Berçarista Tânia',
    allergies: ['APLV em investigação (leite de vaca evitado)'],
    medications: ['Vitamina D3 matinal após o primeiro soninho'],
    dailyLogs: [
      {
        id: 'h-1',
        time: '07:45',
        title: 'Chegada tranquila no berço',
        description: 'Entregue pela mamãe calma e sem choro. Temperatura aferida: 36.4°C.',
        category: 'hygiene',
        icon: 'Baby',
        colorClass: 'text-[#ed145b]',
        bgClass: 'bg-pink-100'
      },
      {
        id: 'h-2',
        time: '09:00',
        title: 'Mamadeira & Frutinha amassada',
        description: 'Tomou 160ml de leite materno fornecido e meia banana-maçã raspadinha com aveia.',
        category: 'meal',
        icon: 'Utensils',
        colorClass: 'text-[#fd9924]',
        bgClass: 'bg-amber-100'
      },
      {
        id: 'h-3',
        time: '10:00',
        title: 'Massagem Shantala & Banho de Sol',
        description: 'Sessão relaxante no tatame com estímulo visual e músicas suaves.',
        category: 'activity',
        icon: 'Sparkles',
        colorClass: 'text-emerald-600',
        bgClass: 'bg-emerald-100'
      },
      {
        id: 'h-4',
        time: '12:30',
        title: 'Soninho do Berçário',
        description: 'Descansando no berço individual com seu paninho de apego.',
        category: 'nap',
        icon: 'Moon',
        colorClass: 'text-[#00a6c0]',
        bgClass: 'bg-sky-100'
      }
    ],
    photos: [
      {
        id: 'hp-1',
        url: SCHOOL_IMAGES.napRoom,
        caption: 'Helena descansando tranquila após o soninho da manhã',
        time: 'Hoje • 09:40'
      },
      {
        id: 'hp-2',
        url: SCHOOL_IMAGES.heroClassroom,
        caption: 'Estimulação visual com brinquedos sensoriais coloridos',
        time: 'Hoje • 10:20'
      }
    ]
  }
];

export const INITIAL_PICKUP_AUTHORIZATIONS = [
  {
    id: 'auth-1',
    personName: 'Sônia Maria Mayelin (Avó)',
    relationship: 'Avó Materna',
    documentId: 'RG 28.491.032-X',
    phone: '(11) 99123-4567',
    date: 'Hoje',
    timeLimit: 'Até às 18:30',
    status: 'Aprovado' as const,
    createdAt: 'Hoje às 08:30'
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Como funciona o período de adaptação do bebê ou da criança?',
    answer: 'A adaptação é 100% gradual e personalizada. Nos primeiros dias, o responsável permanece no espaço de convivência da escola enquanto a criança explora a sala de aula em horários curtos (1h a 2h), aumentando o tempo gradativamente de acordo com a segurança emocional demonstrada.'
  },
  {
    question: 'Quais os horários de entrada e tolerância para o turno integral?',
    answer: 'Para o período integral, nossos portões abrem às 07h00 e o encerramento é às 18h30, com tolerância até às 19h00 com a equipe de plantão acolhedor. A rotina permite flexibilidade de chegada até às 09h00 para não interferir no almoço.'
  },
  {
    question: 'A creche atende crianças com restrições alimentares ou alergias?',
    answer: 'Sim! Nossa nutricionista elabora cardápios individuais e adaptados para APLV (alergia à proteína do leite de vaca), celíacos, intolerantes à lactose ou preferências vegetarianas. O prato é identificado com cor exclusiva na cozinha.'
  },
  {
    question: 'Como os pais acompanham as fotos e registros do dia?',
    answer: 'Cada família possui login seguro em nosso aplicativo. Ao longo do dia, as educadoras alimentam o sistema com informações de trocas, soninho, apetite e postam de 3 a 8 registros fotográficos em alta qualidade.'
  },
  {
    question: 'Qual é a proporção de educadores por criança nas salas?',
    answer: 'No Berçário, mantemos uma rigorosa proporção de 1 educadora/berçarista para cada 3 bebês. No Maternal I & II, temos 1 professora e 1 auxiliar para grupos reduzidos de até 8 a 10 crianças, garantindo atenção individualizada.'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    parentName: 'Camila & Fernando Rocha',
    childInfo: 'Pais da Helena (Berçário)',
    badge: 'Turma 2025',
    badgeColor: 'bg-[#ed145b] text-white',
    quote: 'Colocar a Helena no berçário aos 6 meses com o retorno ao trabalho era meu maior pânico. A equipe da Mayelin não só acolheu minha filha, mas me acolheu como mãe. O aplicativo me dava paz a cada notificação de soninho e mamadeira.',
    rating: 5
  },
  {
    id: 't-2',
    parentName: 'Juliana Mendes',
    childInfo: 'Mãe do Bento (Maternal II)',
    badge: 'Turma 2025',
    badgeColor: 'bg-[#fd9924] text-white',
    quote: 'O desfralde do Bento foi feito com tanta paciência e leveza que pareceu uma brincadeira. Além disso, a alimentação dele melhorou 100% por causa da horta e da nutricionista da escola. Recomendo de olhos fechados!',
    rating: 5
  },
  {
    id: 't-3',
    parentName: 'Rodrigo & Beatriz Alcantara',
    childInfo: 'Pais do Theo (Jardim)',
    badge: 'Turma 2026',
    badgeColor: 'bg-[#00a6c0] text-white',
    quote: 'O Theo acorda todos os dias animado para ir ao Jardim da Mayelin. As oficinas de música e inglês são maravilhosas. Ver a evolução na fala e autonomia dele nos enche de orgulho.',
    rating: 5
  }
];

export const WEEKLY_MENU = [
  {
    day: 'Segunda-feira',
    breakfast: 'Papinha de aveia com maçã cozida e canela em pó suave',
    snackMorning: 'Pedaços de melancia fresca e água de coco',
    lunch: 'Arroz integral cateto, feijão carioquinha, franguinho desfiado em cubos com abobrinha e purê de cenoura',
    snackAfternoon: 'Bolo caseiro de banana sem açúcar com farinha de amêndoas e leite vegetal',
    dinner: 'Sopinha creme de mandioquinha com espinafre fresco e carne moída magra'
  },
  {
    day: 'Terça-feira',
    breakfast: 'Pãozinho de mandioca artesanal com queijinho branco fresco',
    snackMorning: 'Mamão papaia com sementinhas de chia hidratadas',
    lunch: 'Polentinha cremosa com ragu de carne suave, couve refogadinha no azeite extravirgem e saladinha de tomate cereja',
    snackAfternoon: 'Salada de frutas da estação (manga, morango e banana)',
    dinner: 'Macarrãozinho de letrinhas com legumes braseados e caldinho de legumes'
  },
  {
    day: 'Quarta-feira (Dia da Horta)',
    breakfast: 'Vitamina cremosa de abacate com banana e aveia',
    snackMorning: 'Fatias de abacaxi doce com hortelã fresca colhida pelas crianças',
    lunch: 'Peixinho branco ao vapor com crosta de ervas finas, arroz com cenoura ralada e feijão fradinho',
    snackAfternoon: 'Pãozinho caseiro de batata-doce com pastinha de ricota',
    dinner: 'Caldinho de feijão preto com cubinhos de abóbora cabotiá e arroz'
  },
  {
    day: 'Quinta-feira',
    breakfast: 'Panquequinha de banana e aveia com pasta de amendoim suave',
    snackMorning: 'Uvas passas e morangos frescos higienizados',
    lunch: 'Escondidinho de batata-doce com carne desfiada e brócolis ao vapor no azeite',
    snackAfternoon: 'Muffin de maçã com noz moscada sem açúcar refinado',
    dinner: 'Canja nutritiva com legumes em cubinhos e arroz integral'
  },
  {
    day: 'Sexta-feira (Piquenique Lúdico)',
    breakfast: 'Iogurte natural batido com frutas vermelhas frescas',
    snackMorning: 'Melão em formatos de estrelinha e florzinha com água aromatizada',
    lunch: 'Risoto suave de abóbora com cubos de peito de frango orgânico e salada verde baby',
    snackAfternoon: 'Biscoitinhos caseiros de aveia e maçã assados na oficina de culinária',
    dinner: 'Creme de abóbora com gengibre suave e torradinhas integrais'
  }
];

export const PROFILE_OPTIONS: UserProfileInfo[] = [
  {
    role: 'admin',
    label: 'Administração e Gestão Escolar',
    name: 'Dra. Mayelin & Direção Pedagógica',
    description: 'Painel executivo, gestão de matrículas, autorizações de saída e comunicados oficiais',
    avatarBadge: 'ADM'
  },
  {
    role: 'professor',
    label: 'Professor',
    name: 'Profa. Juliana & Equipe Docente',
    description: 'Diário de bordo das turmas, chamada diária, registro de rotina e fotos pedagógicas',
    avatarBadge: 'PROF'
  },
  {
    role: 'pais',
    label: 'Pais/Encarregados',
    name: 'Família Mayelin (Helena & Arthur)',
    description: 'Acompanhamento em tempo real, diário do aluno, fotos, saúde e autorizações de retirada',
    avatarBadge: 'PAIS'
  }
];

export const INITIAL_ANNOUNCEMENTS: SchoolAnnouncement[] = [
  {
    id: 'anc-1',
    title: 'Reunião Pedagógica Trimestral & Apresentação de Portfólios',
    content: 'Convidamos todas as famílias para o nosso encontro pedagógico no próximo sábado às 09:30. Teremos exposição dos projetos artísticos e momento individual com as educadoras.',
    date: 'Hoje',
    target: 'pais',
    priority: 'importante',
    author: 'Direção Geral'
  },
  {
    id: 'anc-2',
    title: 'Campanha de Vacinação Infantil e Atualização do Cartão de Saúde',
    content: 'Lembramos a todos os encarregados de submeter a cópia atualizada do cartão de vacinas das crianças na secretaria escolar ou pelo portal até o fim da próxima semana.',
    date: 'Ontem',
    target: 'todos',
    priority: 'normal',
    author: 'Secretaria & Enfermagem'
  },
  {
    id: 'anc-3',
    title: 'Oficina Sensorial da Primavera: Dia da Fruta na Horta',
    content: 'Na quarta-feira as turmas do Berçário e Maternal farão colheita assistida e piquenique de frutas frescas colhidas em nossa horta agroecológica.',
    date: '02 de Outubro',
    target: 'professores',
    priority: 'normal',
    author: 'Coordenação Pedagógica'
  }
];

