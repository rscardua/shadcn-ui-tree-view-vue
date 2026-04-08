# Feature Specification: Drag and Drop de Nós na Tree View

**Feature Branch**: `005-node-drag-drop`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Agora vamos criar uma funcionalidade capaz de fazer drag and drop dos nós da tree view"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reordenar nós no mesmo nível (Priority: P1)

O usuário deseja arrastar um nó da árvore e soltá-lo em uma nova posição dentro do mesmo nível hierárquico, reordenando os itens visualmente. Ao soltar o nó, a árvore atualiza a ordem dos itens para refletir a nova posição.

**Why this priority**: É a operação de drag and drop mais fundamental e frequente. Sem ela, o recurso não tem utilidade básica.

**Independent Test**: Pode ser testado arrastando qualquer nó para cima ou para baixo dentro de seus irmãos e verificando que a nova ordem persiste na árvore.

**Acceptance Scenarios**:

1. **Given** uma árvore com 3 nós no mesmo nível (A, B, C), **When** o usuário arrasta o nó C para antes do nó A, **Then** a ordem exibida é C, A, B.
2. **Given** uma árvore com nós no mesmo nível, **When** o usuário arrasta um nó e solta na mesma posição original, **Then** a ordem permanece inalterada.
3. **Given** uma árvore com nós no mesmo nível, **When** o usuário inicia o arrasto, **Then** um indicador visual mostra a posição onde o nó será inserido.

---

### User Story 2 - Mover nó para dentro de outro nó (reparenting) (Priority: P2)

O usuário deseja arrastar um nó e soltá-lo sobre outro nó para torná-lo filho desse nó de destino. A árvore atualiza a hierarquia para refletir o novo relacionamento pai-filho.

**Why this priority**: Alterar a hierarquia é o segundo caso de uso mais valioso do drag and drop, permitindo reorganização estrutural da árvore.

**Independent Test**: Pode ser testado arrastando um nó raiz e soltando-o sobre outro nó, verificando que ele se torna filho do nó de destino.

**Acceptance Scenarios**:

1. **Given** um nó A no nível raiz e um nó B no nível raiz, **When** o usuário arrasta A e solta sobre B, **Then** A se torna filho de B e B expande automaticamente para mostrar A.
2. **Given** um nó pai com filhos, **When** o usuário arrasta um nó externo e solta sobre o nó pai, **Then** o nó arrastado é adicionado como último filho do nó pai.
3. **Given** um nó pai, **When** o usuário tenta arrastar o nó pai para dentro de um de seus próprios descendentes, **Then** a operação é impedida e o nó retorna à posição original.

---

### User Story 3 - Feedback visual durante o arrasto (Priority: P2)

O usuário precisa de feedback visual claro durante a operação de drag and drop para entender onde o nó será posicionado ao ser solto. O sistema exibe indicadores visuais que diferenciam entre inserção "antes", "depois" ou "dentro" de um nó.

**Why this priority**: Sem feedback visual adequado, o usuário não consegue usar o drag and drop com confiança, tornando o recurso inutilizável na prática.

**Independent Test**: Pode ser testado arrastando um nó sobre diferentes regiões de outro nó e verificando que indicadores visuais distintos aparecem para cada zona de drop.

**Acceptance Scenarios**:

1. **Given** o usuário está arrastando um nó, **When** o cursor está na parte superior de um nó de destino, **Then** uma linha indicadora aparece acima do nó de destino indicando inserção "antes".
2. **Given** o usuário está arrastando um nó, **When** o cursor está na parte inferior de um nó de destino, **Then** uma linha indicadora aparece abaixo do nó de destino indicando inserção "depois".
3. **Given** o usuário está arrastando um nó, **When** o cursor está no centro de um nó de destino, **Then** o nó de destino é destacado indicando que o nó arrastado se tornará seu filho.
4. **Given** o usuário está arrastando um nó, **When** o cursor sai da área da árvore, **Then** todos os indicadores visuais são removidos.

---

### User Story 4 - Arrastar múltiplos nós selecionados (Priority: P3)

Quando há múltiplos nós selecionados na árvore, o usuário pode arrastar todos os nós selecionados de uma vez para uma nova posição ou dentro de outro nó.

**Why this priority**: Funcionalidade avançada que aumenta a produtividade, mas o drag and drop individual já entrega valor significativo.

**Independent Test**: Pode ser testado selecionando 2+ nós via checkbox ou Ctrl+click, arrastando-os para uma nova posição, e verificando que todos foram movidos.

**Acceptance Scenarios**:

1. **Given** 3 nós selecionados (A, B, C), **When** o usuário arrasta qualquer um deles para uma nova posição, **Then** todos os 3 nós são movidos juntos para a nova posição mantendo sua ordem relativa.
2. **Given** múltiplos nós selecionados em níveis diferentes da hierarquia, **When** o usuário arrasta para dentro de outro nó, **Then** todos são inseridos como filhos do nó de destino.
3. **Given** múltiplos nós selecionados onde um é ancestral de outro, **When** o usuário inicia o arrasto, **Then** apenas os nós de nível mais alto são movidos (descendentes já selecionados são ignorados para evitar duplicação).

---

### Edge Cases

- O que acontece quando o usuário tenta arrastar o único nó raiz da árvore? A reordenação não se aplica, mas mover para outro nível pode ser válido.
- Como o sistema lida quando o nó de destino está colapsado (fechado)? O nó pai expande ao receber o drop.
- O que acontece se o usuário arrasta um nó para fora da área da árvore e solta? A operação é cancelada e o nó retorna à posição original.
- Como a árvore se comporta durante scroll enquanto arrasta? A árvore faz auto-scroll quando o cursor se aproxima das bordas superior ou inferior.
- O que acontece quando o drag and drop é desabilitado via prop? Nenhum comportamento de arrasto é ativado e os nós se comportam normalmente.

## Clarifications

### Session 2026-04-08

- Q: O consumidor pode restringir quais nós específicos são arrastáveis ou podem receber drops? → A: Sim, permitir restrição por nó via propriedades `draggable` e `droppable` individuais por nó.
- Q: O consumidor pode cancelar/impedir a operação de drop via handler do evento? → A: Sim, evento cancelável onde o consumidor pode impedir o move retornando `false` ou chamando `preventDefault`.
- Q: O drag and drop deve funcionar em dispositivos touch (mobile/tablet)? → A: Não, apenas desktop (mouse) no escopo atual. Suporte a touch será melhoria futura.
- Q: Existe limite de profundidade ao fazer reparenting via drag and drop? → A: Sem limite imposto pelo componente. Consumidor controla via evento cancelável ou propriedade `droppable` por nó.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir que o usuário arraste qualquer nó da árvore para reposicioná-lo.
- **FR-002**: O sistema DEVE exibir indicadores visuais durante o arrasto mostrando a zona de drop (antes, depois, dentro).
- **FR-003**: O sistema DEVE permitir reordenar nós dentro do mesmo nível hierárquico.
- **FR-004**: O sistema DEVE permitir mover nós para dentro de outro nó (reparenting), alterando a hierarquia.
- **FR-005**: O sistema DEVE impedir que um nó seja movido para dentro de si mesmo ou de qualquer um de seus descendentes (prevenção de referência circular).
- **FR-006**: O sistema DEVE expandir automaticamente o nó pai ao receber um nó filho via drop.
- **FR-007**: O sistema DEVE permitir que o drag and drop seja habilitado/desabilitado via propriedade global do componente.
- **FR-013**: O sistema DEVE permitir que cada nó individualmente seja marcado como arrastável (`draggable`) e/ou como destino de drop (`droppable`), sobrepondo o comportamento global.
- **FR-008**: O sistema DEVE emitir um evento cancelável ao concluir uma operação de drag and drop, informando o nó movido, a origem e o destino. O consumidor pode impedir o move retornando `false` ou chamando `preventDefault`.
- **FR-009**: O sistema DEVE suportar auto-scroll da árvore quando o cursor se aproxima das bordas durante o arrasto.
- **FR-010**: O sistema DEVE cancelar a operação de arrasto quando o nó é solto fora da área da árvore.
- **FR-011**: O sistema DEVE suportar arrastar múltiplos nós selecionados simultaneamente.
- **FR-012**: O sistema DEVE manter acessibilidade, permitindo reordenação via teclado como alternativa ao mouse.

### Key Entities

- **DragSource**: O nó (ou conjunto de nós) que está sendo arrastado. Contém identificador do nó, posição original e dados associados.
- **DropTarget**: O nó sobre o qual o item arrastado será solto. Define a zona de drop (antes, depois, dentro) baseada na posição do cursor.
- **DropIndicator**: Elemento visual que mostra ao usuário onde o nó será posicionado. Pode ser uma linha horizontal (antes/depois) ou um destaque no nó (dentro).
- **DragEvent**: Evento emitido ao concluir a operação contendo: nó(s) movido(s), nó pai original, nó pai de destino, posição de inserção.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue reordenar nós em até 2 segundos por operação (arrasto + soltura).
- **SC-002**: O feedback visual de posicionamento aparece em menos de 100ms após o cursor entrar em uma zona de drop.
- **SC-003**: 100% das tentativas de criar referência circular (mover nó para dentro de seu descendente) são bloqueadas.
- **SC-004**: O usuário consegue mover nós entre diferentes níveis da hierarquia sem perda de dados dos nós filhos.
- **SC-005**: A funcionalidade de drag and drop funciona corretamente em árvores com até 1000 nós visíveis sem degradação perceptível de performance.
- **SC-006**: O drag and drop é utilizável via teclado para usuários que não utilizam mouse.

## Assumptions

- O componente TreeView já possui funcionalidade de seleção de nós que pode ser reutilizada para selecionar múltiplos nós para arrasto.
- O drag and drop será desabilitado por padrão e deve ser habilitado explicitamente via propriedade.
- A funcionalidade utilizará as capacidades nativas de arrastar e soltar do navegador como base.
- A operação de drag and drop atualiza apenas o estado visual/dados em memória; a persistência dos dados é responsabilidade do consumidor do componente.
- O auto-scroll durante arrasto segue o comportamento padrão do navegador, com possível customização se necessário.
- A acessibilidade via teclado seguirá o padrão ARIA para reordenação (ex: Alt+Seta para mover nós).
- O suporte a dispositivos touch (mobile/tablet) está fora do escopo desta feature e será tratado como melhoria futura.
