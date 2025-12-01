export type Language = 'pt' | 'fr';

export const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.close': 'Fechar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Adicionar',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.loading': 'A carregar...',
    'common.noResults': 'Nenhum resultado encontrado',
    'common.confirm': 'Confirmar',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.previous': 'Anterior',
    'common.yes': 'Sim',
    'common.no': 'Não',
    'common.all': 'Todos',
    'common.none': 'Nenhum',
    'common.actions': 'Ações',
    'common.details': 'Detalhes',
    'common.viewDetails': 'Ver Detalhes',
    'common.generate': 'Gerar',
    'common.clear': 'Limpar',
    'common.clearCache': 'Limpar Cache',
    'common.logout': 'Sair',

    // Navigation
    'nav.home': 'Página Inicial',
    'nav.groups': 'Grupos',
    'nav.newMember': 'Novo Membro',
    'nav.services': 'Serviços Musicais',
    'nav.reports': 'Relatórios',
    'nav.admins': 'Administradores',
    'nav.settings': 'Configurações',
    'nav.contact': 'Contacto',
    'nav.sheetMusic': 'Partituras',

    // Header
    'header.sessionInfo': 'Informações da Sessão',
    'header.accessCode': 'Código de Acesso',
    'header.administrator': 'Administrador',
    'header.group': 'Grupo',
    'header.member': 'Membro',
    'header.code': 'Código',
    'header.system': 'Sistema de Gestão',

    // Dashboard
    'dashboard.title': 'Painel Principal',
    'dashboard.welcome': 'Bem-vindo ao SIGEG-BV',
    'dashboard.description': 'O SIGEG-BV (Sistema de Gestão de Grupos - Boa Vista) é uma plataforma completa para gestão de grupos musicais, oferecendo funcionalidades de gestão de membros, finanças, programas semanais e muito mais.',
    'dashboard.financialSummary': 'Resumo Financeiro',
    'dashboard.statistics': 'Estatísticas',
    'dashboard.recentGroups': 'Grupos Recentes',
    'dashboard.totalGroups': 'Total de Grupos',
    'dashboard.totalMembers': 'Total de Membros',
    'dashboard.activeMembers': 'Membros Ativos',
    'dashboard.totalBalance': 'Saldo Total',

    // Groups
    'groups.title': 'Grupos',
    'groups.newGroup': 'Novo Grupo',
    'groups.searchPlaceholder': 'Pesquisar grupos...',
    'groups.noGroups': 'Nenhum grupo encontrado',
    'groups.members': 'Membros',
    'groups.direction': 'Direção',
    'groups.municipality': 'Município',
    'groups.province': 'Província',
    'groups.inactive': 'Grupo Inativo',
    'groups.accessCode': 'Código de Acesso',

    // Members
    'members.title': 'Membros',
    'members.newMember': 'Novo Membro',
    'members.searchPlaceholder': 'Pesquisar membros...',
    'members.noMembers': 'Nenhum membro encontrado',
    'members.name': 'Nome',
    'members.role': 'Função',
    'members.partition': 'Partição',
    'members.phone': 'Telefone',
    'members.birthDate': 'Data de Nascimento',
    'members.status': 'Estado',
    'members.active': 'Ativo',
    'members.inactive': 'Inativo',
    'members.memberCode': 'Código do Membro',

    // Financial
    'financial.title': 'Área Financeira',
    'financial.categories': 'Categorias Financeiras',
    'financial.transactions': 'Transações',
    'financial.paymentEvents': 'Eventos de Pagamento',
    'financial.newTransaction': 'Nova Transação',
    'financial.newEvent': 'Novo Evento',
    'financial.balance': 'Saldo',
    'financial.income': 'Receita',
    'financial.expense': 'Despesa',
    'financial.amount': 'Valor',
    'financial.description': 'Descrição',
    'financial.date': 'Data',
    'financial.type': 'Tipo',
    'financial.category': 'Categoria',
    'financial.manageLeaders': 'Gerir Líderes',
    'financial.completed': 'Concluído',
    'financial.partial': 'Parcial',
    'financial.pending': 'Pendente',
    'financial.amountToPay': 'Valor a Pagar',
    'financial.amountPaid': 'Valor Pago',

    // Technical
    'technical.title': 'Área Técnica',
    'technical.weeklyProgram': 'Programa Semanal',
    'technical.attendance': 'Presenças',
    'technical.rehearsals': 'Ensaios',
    'technical.newProgram': 'Novo Programa',
    'technical.hymns': 'Hinos',
    'technical.accompaniments': 'Acompanhamentos',
    'technical.viewRecords': 'Ver Registros',

    // Tabs
    'tabs.info': 'Informações',
    'tabs.members': 'Membros',
    'tabs.financial': 'Finanças',
    'tabs.technical': 'Área Técnica',
    'tabs.financialRecords': 'Registros Financeiros',
    'tabs.paymentControl': 'Controlo de Pagamentos',

    // Services
    'services.title': 'Serviços Musicais',
    'services.arrangements': 'Arranjos Musicais',
    'services.accompaniments': 'Acompanhamentos de Hinos',
    'services.reviews': 'Revisão de Arranjos',

    // Contact
    'contact.subtitle': 'Entra em contacto se precisar de ajuda ou esclarecimentos',
    'contact.whatsapp': 'WhatsApp',
    'contact.email': 'Email',
    'contact.creator': 'Criador',

    // Auth
    'auth.login': 'Entrar',
    'auth.memberLogin': 'Acesso de Membro',
    'auth.groupLogin': 'Acesso de Grupo',
    'auth.adminLogin': 'Acesso de Administrador',
    'auth.enterCode': 'Digite seu código',
    'auth.accessDenied': 'Acesso Negado',
    'auth.adminOnly': 'Só Administradores têm acesso',

    // Errors
    'error.general': 'Ocorreu um erro',
    'error.notFound': 'Não encontrado',
    'error.unauthorized': 'Não autorizado',
    'error.forbidden': 'Acesso proibido',

    // Partitions
    'partition.soprano': 'Soprano',
    'partition.contralto': 'Contralto',
    'partition.alto': 'Alto',
    'partition.tenor': 'Tenor',
    'partition.bass': 'Baixo',
    'partition.instrumental': 'Instrumental',
    'partition.none': 'Sem Partição',

    // Language
    'language.toggle': 'Traduzir para Francês',
    'language.current': 'Português',
  },
  
  fr: {
    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.close': 'Fermer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.loading': 'Chargement...',
    'common.noResults': 'Aucun résultat trouvé',
    'common.confirm': 'Confirmer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.all': 'Tous',
    'common.none': 'Aucun',
    'common.actions': 'Actions',
    'common.details': 'Détails',
    'common.viewDetails': 'Voir les Détails',
    'common.generate': 'Générer',
    'common.clear': 'Effacer',
    'common.clearCache': 'Vider le Cache',
    'common.logout': 'Déconnexion',

    // Navigation
    'nav.home': 'Accueil',
    'nav.groups': 'Groupes',
    'nav.newMember': 'Nouveau Membre',
    'nav.services': 'Services Musicaux',
    'nav.reports': 'Rapports',
    'nav.admins': 'Administrateurs',
    'nav.settings': 'Paramètres',
    'nav.contact': 'Contact',
    'nav.sheetMusic': 'Partitions',

    // Header
    'header.sessionInfo': 'Informations de Session',
    'header.accessCode': 'Code d\'Accès',
    'header.administrator': 'Administrateur',
    'header.group': 'Groupe',
    'header.member': 'Membre',
    'header.code': 'Code',
    'header.system': 'Système de Gestion',

    // Dashboard
    'dashboard.title': 'Tableau de Bord',
    'dashboard.welcome': 'Bienvenue sur SIGEG-BV',
    'dashboard.description': 'SIGEG-BV (Système de Gestion de Groupes - Boa Vista) est une plateforme complète pour la gestion des groupes musicaux, offrant des fonctionnalités de gestion des membres, des finances, des programmes hebdomadaires et bien plus encore.',
    'dashboard.financialSummary': 'Résumé Financier',
    'dashboard.statistics': 'Statistiques',
    'dashboard.recentGroups': 'Groupes Récents',
    'dashboard.totalGroups': 'Total des Groupes',
    'dashboard.totalMembers': 'Total des Membres',
    'dashboard.activeMembers': 'Membres Actifs',
    'dashboard.totalBalance': 'Solde Total',

    // Groups
    'groups.title': 'Groupes',
    'groups.newGroup': 'Nouveau Groupe',
    'groups.searchPlaceholder': 'Rechercher des groupes...',
    'groups.noGroups': 'Aucun groupe trouvé',
    'groups.members': 'Membres',
    'groups.direction': 'Direction',
    'groups.municipality': 'Municipalité',
    'groups.province': 'Province',
    'groups.inactive': 'Groupe Inactif',
    'groups.accessCode': 'Code d\'Accès',

    // Members
    'members.title': 'Membres',
    'members.newMember': 'Nouveau Membre',
    'members.searchPlaceholder': 'Rechercher des membres...',
    'members.noMembers': 'Aucun membre trouvé',
    'members.name': 'Nom',
    'members.role': 'Fonction',
    'members.partition': 'Partition',
    'members.phone': 'Téléphone',
    'members.birthDate': 'Date de Naissance',
    'members.status': 'Statut',
    'members.active': 'Actif',
    'members.inactive': 'Inactif',
    'members.memberCode': 'Code du Membre',

    // Financial
    'financial.title': 'Espace Financier',
    'financial.categories': 'Catégories Financières',
    'financial.transactions': 'Transactions',
    'financial.paymentEvents': 'Événements de Paiement',
    'financial.newTransaction': 'Nouvelle Transaction',
    'financial.newEvent': 'Nouvel Événement',
    'financial.balance': 'Solde',
    'financial.income': 'Revenu',
    'financial.expense': 'Dépense',
    'financial.amount': 'Montant',
    'financial.description': 'Description',
    'financial.date': 'Date',
    'financial.type': 'Type',
    'financial.category': 'Catégorie',
    'financial.manageLeaders': 'Gérer les Leaders',
    'financial.completed': 'Terminé',
    'financial.partial': 'Partiel',
    'financial.pending': 'En Attente',
    'financial.amountToPay': 'Montant à Payer',
    'financial.amountPaid': 'Montant Payé',

    // Technical
    'technical.title': 'Espace Technique',
    'technical.weeklyProgram': 'Programme Hebdomadaire',
    'technical.attendance': 'Présences',
    'technical.rehearsals': 'Répétitions',
    'technical.newProgram': 'Nouveau Programme',
    'technical.hymns': 'Hymnes',
    'technical.accompaniments': 'Accompagnements',
    'technical.viewRecords': 'Voir les Registres',

    // Tabs
    'tabs.info': 'Informations',
    'tabs.members': 'Membres',
    'tabs.financial': 'Finances',
    'tabs.technical': 'Espace Technique',
    'tabs.financialRecords': 'Registres Financiers',
    'tabs.paymentControl': 'Contrôle des Paiements',

    // Services
    'services.title': 'Services Musicaux',
    'services.arrangements': 'Arrangements Musicaux',
    'services.accompaniments': 'Accompagnements d\'Hymnes',
    'services.reviews': 'Révision d\'Arrangements',

    // Contact
    'contact.subtitle': 'Contactez-nous si vous avez besoin d\'aide ou de clarifications',
    'contact.whatsapp': 'WhatsApp',
    'contact.email': 'Email',
    'contact.creator': 'Créateur',

    // Auth
    'auth.login': 'Connexion',
    'auth.memberLogin': 'Accès Membre',
    'auth.groupLogin': 'Accès Groupe',
    'auth.adminLogin': 'Accès Administrateur',
    'auth.enterCode': 'Entrez votre code',
    'auth.accessDenied': 'Accès Refusé',
    'auth.adminOnly': 'Réservé aux Administrateurs',

    // Errors
    'error.general': 'Une erreur s\'est produite',
    'error.notFound': 'Non trouvé',
    'error.unauthorized': 'Non autorisé',
    'error.forbidden': 'Accès interdit',

    // Partitions
    'partition.soprano': 'Soprano',
    'partition.contralto': 'Contralto',
    'partition.alto': 'Alto',
    'partition.tenor': 'Ténor',
    'partition.bass': 'Basse',
    'partition.instrumental': 'Instrumental',
    'partition.none': 'Sans Partition',

    // Language
    'language.toggle': 'Traduire en Portugais',
    'language.current': 'Français',
  }
};

export function getTranslation(language: Language, key: string): string {
  return translations[language][key] || key;
}
