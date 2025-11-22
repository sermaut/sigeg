import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Iniciando migração de usuários existentes...');
    
    // Buscar todos os admins ativos
    const { data: admins } = await supabaseAdmin
      .from('system_admins')
      .select('*')
      .eq('is_active', true);
    
    // Buscar todos os membros ativos
    const { data: members } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('is_active', true);
    
    const results = {
      adminsCreated: 0,
      adminsSkipped: 0,
      membersCreated: 0,
      membersSkipped: 0,
      errors: [] as any[]
    };
    
    // Criar contas para admins
    if (admins) {
      console.log(`📋 Processando ${admins.length} administradores...`);
      
      for (const admin of admins) {
        const email = `admin-${admin.id}@sigeg.internal`;
        const password = admin.access_code;
        
        try {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              sigeg_user: {
                type: 'admin',
                data: admin,
                permissions: ['*']
              }
            }
          });
          
          if (error) {
            if (error.message.includes('already registered')) {
              console.log(`⏭️ Admin ${admin.name} já existe`);
              results.adminsSkipped++;
            } else {
              console.error(`❌ Erro ao criar admin ${admin.name}:`, error.message);
              results.errors.push({ type: 'admin', id: admin.id, name: admin.name, error: error.message });
            }
          } else {
            console.log(`✅ Admin ${admin.name} criado com sucesso`);
            results.adminsCreated++;
          }
        } catch (err) {
          console.error(`💥 Erro crítico ao processar admin ${admin.name}:`, err);
          results.errors.push({ type: 'admin', id: admin.id, name: admin.name, error: String(err) });
        }
      }
    }
    
    // Criar contas para membros
    if (members) {
      console.log(`📋 Processando ${members.length} membros...`);
      
      for (const member of members) {
        const email = `member-${member.id}@sigeg.internal`;
        const password = member.member_code;
        
        try {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              sigeg_user: {
                type: 'member',
                data: member,
                permissions: []
              }
            }
          });
          
          if (error) {
            if (error.message.includes('already registered')) {
              console.log(`⏭️ Membro ${member.name} já existe`);
              results.membersSkipped++;
            } else {
              console.error(`❌ Erro ao criar membro ${member.name}:`, error.message);
              results.errors.push({ type: 'member', id: member.id, name: member.name, error: error.message });
            }
          } else {
            console.log(`✅ Membro ${member.name} criado com sucesso`);
            results.membersCreated++;
          }
        } catch (err) {
          console.error(`💥 Erro crítico ao processar membro ${member.name}:`, err);
          results.errors.push({ type: 'member', id: member.id, name: member.name, error: String(err) });
        }
      }
    }
    
    console.log('🎉 Migração concluída!');
    console.log(`📊 Resumo:`, results);
    
    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('💥 Erro crítico na migração:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
