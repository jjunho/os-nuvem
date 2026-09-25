const ko = {
  "Dados locais do comunicador inválidos":
    "메신저의 로컬 데이터가 올바르지 않습니다",
  "Resposta inválida do comunicador": "메신저 응답이 올바르지 않습니다",
  "Enviando…": "전송 중…",
  "Não foi possível enviar o reporte": "문제 보고를 전송하지 못했습니다",
  "Não foi possível salvar. Tente novamente.":
    "저장하지 못했습니다. 다시 시도하세요.",
  "Carregando…": "불러오는 중…",

  "Atividade da tarefa": "업무 활동",
  "Mensagens seguintes": "다음 메시지",
  "Reportar problema": "문제 신고",
  Página: "페이지",
  Ação: "수행한 작업",
  Esperado: "기대 결과",
  Observado: "실제 결과",
  Reprodução: "재현 방법",
  "Captura pronta": "화면 캡처 완료",
  "Capturando página": "화면 캡처 중",
  "Enviar reporte": "신고 보내기",
  "Tentar novamente": "다시 시도",
  "Não foi possível capturar a página": "화면을 캡처하지 못했습니다",

  "Boas-vindas": "환영합니다",
  "Instalar no celular": "휴대폰에 설치",
  "Ativar notificações": "알림 켜기",
  "No Safari, toque em Compartilhar e Adicionar à Tela de Início. Abra pelo ícone para ativar notificações (iOS 16.4 ou posterior).":
    "Safari에서 공유를 누른 뒤 홈 화면에 추가하세요. 아이콘으로 열면 알림을 켤 수 있습니다(iOS 16.4 이상).",
  "No menu do navegador, escolha Instalar aplicativo ou Adicionar à tela inicial.":
    "브라우저 메뉴에서 앱 설치 또는 홈 화면에 추가를 선택하세요.",

  Foto: "사진",
  Câmera: "카메라",
  "Segure para gravar": "길게 눌러 녹음",
  Gravando: "녹음 중",
  Áudio: "음성",
  "Arquivo removido": "삭제된 파일",
  "Movido para o Viajante": "여행자 문서로 이동됨",
  "Remover arquivo definitivamente": "파일 영구 삭제",
  "Mover para o Viajante": "여행자 문서로 이동",
  "Buscar Viajante": "여행자 검색",
  Zoom: "확대",
  "Microfone indisponível": "마이크를 사용할 수 없습니다",

  "Transformar em Tarefa": "작업으로 전환",
  "Nova tarefa": "새 작업",
  Título: "제목",
  Responsável: "담당자",
  Prazo: "기한",
  Cópias: "참조",
  Concluir: "완료",
  Referências: "참조 검색",
  "Conversa interna": "내부 대화",

  "Notificações do grupo": "그룹 알림",
  Todas: "모든 메시지",
  "Somente menções": "멘션만",
  Silenciar: "알림 끄기",
  "Não perturbe": "방해 금지",
  Início: "시작",
  Fim: "종료",
  "Fuso horário": "시간대",
  Urgente: "긴급",
  "O Admin pode ler todas as conversas, inclusive as diretas.":
    "관리자는 개인 대화를 포함한 모든 대화를 읽을 수 있습니다.",
  Entendi: "확인",
  "Atalhos: @ pessoa · @todos · @aqui · # grupo · [[ referência · /tarefa · /urgente · /bug":
    "단축키: @ 사람 · @todos 모두 · @aqui 활성 사용자 · # 그룹 · [[ 참조 · /tarefa 작업 · /urgente 긴급 · /bug 오류",

  "Buscar mensagens": "메시지 검색",
  Autor: "작성자",
  Data: "날짜",
  "Todas as conversas": "모든 대화",
  "Visto por": "읽은 사람",
  "Marcar como não lida": "읽지 않음으로 표시",
  "Mensagens anteriores": "이전 메시지",
  "Não lidas": "읽지 않은 메시지",

  "Novo grupo": "새 그룹",
  Nome: "이름",
  Descrição: "설명",
  Privado: "비공개",
  "Criar grupo": "그룹 만들기",
  "Grupos públicos": "공개 그룹",
  "Entrar no grupo": "그룹 가입",
  "Sair do grupo": "그룹 나가기",
  "Gerenciar grupo": "그룹 관리",
  Salvar: "저장",
  Arquivada: "보관됨",
  "Mostrar arquivadas": "보관된 대화 표시",
  Convidar: "초대",
  "Remover membro": "멤버 삭제",
  Editar: "수정",
  Apagar: "삭제",
  Apagada: "삭제됨",
  Editada: "수정됨",
  Histórico: "수정 내역",
  Citar: "인용",
  Inativo: "비활성",
  Cancelar: "취소",
  Reagir: "반응",
  Original: "원본",

  Comunicador: "소통",
  "Conversa direta": "개인 대화",
  "Iniciar conversa": "대화 시작",
  Mensagem: "메시지",
  Enviar: "보내기",
  Fechar: "닫기",
  Pendente: "전송 대기",
  "Falhou. Tentar novamente": "실패. 다시 시도",
  "Escolher usuário": "직원 선택",
  "Nenhuma conversa": "대화 없음",
  "Acesso restrito": "접근 제한",
} as const;
export function textos(idioma: "pt" | "ko") {
  return (s: keyof typeof ko) => (idioma === "ko" ? ko[s] : s);
}
export function erroTraduzido(idioma: "pt" | "ko", texto: string) {
  const limpo = texto.replace(/^Error:\s*/, "");
  if (idioma === "pt") return limpo;
  const erros: Record<string, string> = {
    "Acesso restrito": "접근 권한이 없습니다",
    "Conversa arquivada": "보관된 대화입니다",
    "Dados inválidos": "입력값을 확인하세요",
    "Arquivo inválido ou maior que 12 MB":
      "파일이 올바르지 않거나 12MB를 초과했습니다",
    "Formato não suportado": "지원하지 않는 파일 형식입니다",
    "Imagem inválida": "올바르지 않은 이미지입니다",
  };
  return texto
    ? (erros[limpo] ?? "작업을 완료하지 못했습니다. 다시 시도하세요.")
    : "";
}

export function atividadeTarefa(idioma: "pt" | "ko", tipo: string | null) {
  const rotulos: Record<string, [string, string]> = {
    criada: ["Tarefa criada", "업무 생성"],
    concluida: ["Tarefa concluída", "업무 완료"],
    reaberta: ["Tarefa reaberta", "업무 다시 열기"],
    cancelada: ["Tarefa cancelada", "업무 취소"],
    arquivada: ["Tarefa arquivada", "업무 보관"],
    delegada: ["Responsável alterado", "담당자 변경"],
    transferida: ["Responsável alterado", "담당자 변경"],
    movida: ["Tarefa movida", "업무 이동"],
    checklist: ["Checklist atualizado", "체크리스트 변경"],
    editada: ["Tarefa atualizada", "업무 수정"],
  };
  return (rotulos[tipo ?? ""] ?? ["Atividade da tarefa", "업무 활동"])[
    idioma === "ko" ? 1 : 0
  ];
}
