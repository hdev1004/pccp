// 알고리즘 위키 데이터 - PCCP 3급 커리큘럼 기반
// 초보자 눈높이로 비유와 예시를 많이 사용
const wikiData = [
  {
    id: 'time-complexity',
    title: '시간복잡도란?',
    category: '기초 개념',
    icon: 'clock',
    color: '#3182f6',
    summary: '코드가 얼마나 빠른지 측정하는 방법 — 입력이 커지면 얼마나 느려질까?',
    week: null,
    content: {
      references: [
        {
          title: '빅오 복잡도 비교 차트',
          source: 'bigocheatsheet.com',
          url: 'https://www.bigocheatsheet.com/',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Comparison_computational_complexity.svg',
        },
      ],
      description: `시간복잡도는 쉽게 말해 **"데이터가 많아지면 내 코드가 얼마나 느려지는가?"**를 나타냅니다.

## 비유로 이해하기
친구 10명의 이름표에서 내 이름을 찾는다고 해봅시다:
- **하나씩 보기**: 최악의 경우 10번 확인 → 친구가 100명이면? 100번! → **O(n)**
- **이름표가 정렬되어 있으면**: 가운데부터 반씩 줄여가며 찾기 → 100명이어도 7번이면 OK → **O(log n)**
- **내 자리 번호를 알고 있으면**: 바로 찾기 → 몇 명이든 1번 → **O(1)**

## Big-O 표기법
Big-O는 **"최악의 경우 얼마나 걸리나?"**를 표현합니다. 자잘한 숫자는 무시하고 핵심만 봅니다.

예를 들어:
- 3n² + 5n + 10 → 가장 큰 n²만 남김 → **O(n²)**
- 2n + 100 → **O(n)**
- 항상 같은 시간 → **O(1)**

## 주요 복잡도 비교 (데이터 1,000개일 때)

| 복잡도 | 이름 | 대략 몇 번? | 체감 |
|---------|------|------------|------|
| O(1) | 상수 | 1번 | 눈 깜빡할 사이 |
| O(log n) | 로그 | ~10번 | 매우 빠름 |
| O(n) | 선형 | 1,000번 | 충분히 빠름 |
| O(n log n) | 선형 로그 | ~10,000번 | 괜찮음 |
| O(n²) | 이차 | 1,000,000번 | 좀 느림 |
| O(2ⁿ) | 지수 | 우주가 끝나도 못 끝남 | 사실상 불가능 |

## 시간복잡도 구하는 방법

코드를 보고 시간복잡도를 구하는 건 어렵지 않습니다. **반복문을 세면 됩니다!**

### 규칙 1: 반복문이 몇 겹인지 보기
- for문 1개 → **O(n)**
- for문 안에 for문 (이중) → **O(n²)**
- for문 안에 for문 안에 for문 (삼중) → **O(n³)**

### 규칙 2: 반복마다 반씩 줄어들면 log
- while문에서 i를 2로 나누거나 2배 곱하면 → **O(log n)**
- for문 O(n) 안에 이런 while문이 있으면 → **O(n log n)**

### 규칙 3: 여러 단계는 더하기, 중첩은 곱하기
- for문 O(n) 끝나고 또 for문 O(n) → O(n) + O(n) = **O(n)**
- for문 O(n) 안에 for문 O(n) → O(n) × O(n) = **O(n²)**

### 규칙 4: 상수는 무시
- 3n + 5 → **O(n)** (3과 5는 무시)
- 2n² + 100n → **O(n²)** (가장 큰 차수만)

### 실전 예시로 연습

\`\`\`python
# 예시 1: for문 1개 → O(n)
for i in range(n):
    print(i)

# 예시 2: 이중 for문 → O(n²)
for i in range(n):
    for j in range(n):
        print(i, j)

# 예시 3: 반씩 줄어드는 while → O(log n)
i = n
while i > 0:
    print(i)
    i = i // 2  # 매번 반으로 줄어듦

# 예시 4: for + 내부 while(반씩) → O(n log n)
for i in range(n):
    j = n
    while j > 0:
        j = j // 2

# 예시 5: 연속 for문 → O(n) + O(n) = O(n)
for i in range(n):
    print(i)
for j in range(n):
    print(j)
\`\`\`

### 자주 나오는 패턴 정리

| 코드 패턴 | 시간복잡도 | 왜? |
|-----------|-----------|-----|
| arr[i] 접근 | O(1) | 인덱스로 바로 접근 |
| for문 1개 | O(n) | n번 반복 |
| 이중 for문 | O(n²) | n × n번 |
| 반씩 나누기 | O(log n) | 2로 계속 나누면 log₂n번 |
| 정렬 후 탐색 | O(n log n) | 정렬이 제일 오래 걸림 |
| 재귀 2갈래 | O(2ⁿ) | 매번 2배로 분기 |

## 코딩 테스트 꿀팁
입력 크기(n)를 보면 어떤 알고리즘을 써야 하는지 감이 옵니다:
- n ≤ 10 → 뭘 써도 OK (완전탐색 O(n!))
- n ≤ 20~25 → 부분집합 O(2ⁿ) 가능
- n ≤ 10,000 → 이중 반복문 O(n²) 가능
- n ≤ 1,000,000 → 정렬 O(n log n)까지만
- n ≤ 100,000,000 → 한 번 순회 O(n)만 가능`,
      complexities: [
        { notation: 'O(1)', name: '상수 시간', description: '데이터가 아무리 많아도 같은 시간', example: '배열 인덱스 접근, 해시맵 조회', growth: 1 },
        { notation: 'O(log n)', name: '로그 시간', description: '반씩 줄여가며 찾기', example: '이진 탐색', growth: 10 },
        { notation: 'O(n)', name: '선형 시간', description: '데이터 수만큼 반복', example: '배열 전체 순회', growth: 100 },
        { notation: 'O(n log n)', name: '선형 로그 시간', description: '효율적인 정렬의 속도', example: '병합 정렬, 퀵 정렬', growth: 200 },
        { notation: 'O(n²)', name: '이차 시간', description: '이중 for문 — 느려지기 시작', example: '버블 정렬', growth: 500 },
        { notation: 'O(2ⁿ)', name: '지수 시간', description: '1개 추가될 때마다 2배 느려짐', example: '부분집합 전부 만들기', growth: 900 },
      ],
      codeExamples: [
        {
          title: 'O(1) - 바로 찾기',
          language: 'python',
          code: `# 배열에서 3번째 원소 꺼내기 → 항상 1번에 끝남
arr = [10, 20, 30, 40, 50]
print(arr[2])  # 30 → 배열이 100만개여도 똑같이 빠름

# 딕셔너리에서 값 찾기 → 역시 O(1)
phone = {"철수": "010-1234", "영희": "010-5678"}
print(phone["철수"])  # 사람이 100만명이어도 바로 찾음`,
        },
        {
          title: 'O(n) - 하나씩 전부 확인',
          language: 'python',
          code: `# 반에서 가장 키 큰 학생 찾기 → 전부 확인해야 함
students = [165, 170, 158, 180, 172]
tallest = students[0]
for height in students:      # 학생 수만큼 반복
    if height > tallest:
        tallest = height
print(tallest)  # 180`,
        },
        {
          title: 'O(n²) - 이중 for문 (모든 쌍 비교)',
          language: 'python',
          code: `# 반 학생들끼리 악수하는 모든 경우 → 이중 반복
students = ["철수", "영희", "민수", "지수"]
for i in range(len(students)):
    for j in range(i+1, len(students)):
        print(f"{students[i]} ↔ {students[j]}")
# 4명이면 6번, 40명이면 780번, 400명이면 79,800번!`,
        },
      ],
    },
  },
  {
    id: 'array',
    title: '배열 (Array)',
    category: '자료구조',
    icon: 'list',
    color: '#3182f6',
    summary: '데이터를 번호표를 붙여 순서대로 저장하는 가장 기본적인 칸막이 상자',
    week: 1,
    content: {
      references: [
        {
          title: '배열 메모리 구조',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Array_(data_structure)',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Array1.svg',
        },
      ],
      description: `배열은 **칸막이가 있는 서랍장**과 같습니다. 각 칸에 번호(인덱스)가 붙어 있어서, "3번 서랍 열어줘"하면 바로 열 수 있죠.

## 비유: 사물함
- 학교 사물함 100개가 일렬로 있다고 생각해보세요
- 37번 사물함을 열려면? → 바로 37번으로 가면 됨 (**O(1)**)
- "여기 축구공이 있는 사물함이 어디지?" → 1번부터 하나씩 열어봐야 함 (**O(n)**)
- 50번 사물함 사이에 새 사물함을 끼우려면? → 뒤에 있는 것들을 전부 밀어야 함 (**O(n)**)

## 주요 연산 시간복잡도

| 연산 | 시간복잡도 | 비유 |
|------|-----------|------|
| arr[i] 접근 | O(1) | 37번 사물함 바로 열기 |
| 끝에 추가 | O(1) | 맨 뒤에 새 사물함 놓기 |
| 중간에 삽입 | O(n) | 사이에 끼우려면 뒤를 다 밀어야 |
| 검색 | O(n) | 하나씩 열어보기 |

## PCCP에서 자주 쓰는 배열 기법
- **투 포인터**: 양 끝에서 시작해서 좁혀가며 찾기
- **슬라이딩 윈도우**: 일정 크기의 창문을 밀면서 확인
- **누적합**: 미리 합계를 구해놓으면 구간 합을 바로 계산`,
      complexities: [
        { notation: 'O(1)', name: '인덱스 접근', description: '번호로 바로 찾기', example: 'arr[3]', growth: 1 },
        { notation: 'O(1)', name: '끝에 추가', description: '맨 뒤에 붙이기', example: 'arr.append(x)', growth: 1 },
        { notation: 'O(n)', name: '검색', description: '하나씩 확인', example: 'x in arr', growth: 100 },
        { notation: 'O(n)', name: '삽입/삭제', description: '나머지를 밀거나 당기기', example: 'arr.insert(0, x)', growth: 100 },
      ],
      codeExamples: [
        {
          title: '투 포인터 - 양쪽에서 좁혀가기',
          language: 'python',
          code: `# 정렬된 배열에서 합이 target인 두 수 찾기
# 비유: 시소 — 너무 가벼우면 왼쪽을 무겁게, 너무 무거우면 오른쪽을 가볍게
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        total = arr[left] + arr[right]
        if total == target:
            return [left, right]    # 찾았다!
        elif total < target:
            left += 1    # 합이 작으니 더 큰 수 쪽으로
        else:
            right -= 1   # 합이 크니 더 작은 수 쪽으로
    return []

# 예: arr = [1, 3, 5, 7, 9], target = 8
# 1+9=10 (크다→right 이동) → 1+7=8 (찾았다!)`,
        },
        {
          title: '슬라이딩 윈도우 - 창문 밀기',
          language: 'python',
          code: `# 연속 3일간 매출이 가장 높은 구간 찾기
# 비유: 3칸짜리 돋보기를 오른쪽으로 한 칸씩 밀기
sales = [100, 200, 300, 250, 150, 400]
k = 3  # 3일 연속

window = sum(sales[:k])  # 처음 3일: 100+200+300 = 600
best = window

for i in range(k, len(sales)):
    window += sales[i] - sales[i - k]  # 새로 들어온 거 더하고, 빠진 거 빼기
    best = max(best, window)

print(best)  # 800 (300+250+150... 아니, 250+150+400=800)`,
        },
      ],
    },
  },
  {
    id: 'string',
    title: '문자열 (String)',
    category: '자료구조',
    icon: 'type',
    color: '#6366f1',
    summary: '글자들을 한 줄로 이어놓은 것 — 문자 하나하나가 배열처럼 저장됨',
    week: 2,
    content: {
      references: [
        {
          title: 'ASCII 코드표',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/ASCII',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/ASCII-Table-wide.svg',
        },
      ],
      description: `문자열은 **글자들이 한 줄로 나열된 것**입니다. "hello"는 ['h','e','l','l','o'] 배열과 같아요.

## 비유: 기차 객실
- 문자열은 기차와 같습니다. 각 객실(칸)에 글자가 하나씩 탑승
- 5번째 칸에 누가 있는지 보려면? → s[4]로 바로 확인 (**O(1)**)
- 두 기차를 연결하려면? → 새 기차를 만들어야 함 (**O(n)**)

## Python 문자열의 특징
⚠️ Python 문자열은 **수정 불가(immutable)**합니다!
"hello"를 "Hello"로 바꾸려면 새 문자열을 만들어야 해요.

## 유용한 문자열 도구들
- \`ord('A')\` → 65 (글자를 숫자로)
- \`chr(65)\` → 'A' (숫자를 글자로)
- \`s[::-1]\` → 문자열 뒤집기
- \`''.join(list)\` → 리스트를 문자열로

## PCCP 빈출 패턴
- **아스키 코드로 계산**: 시저 암호처럼 글자를 밀기
- **회문(팰린드롬)**: 앞에서 읽으나 뒤에서 읽으나 같은 문자열`,
      complexities: [
        { notation: 'O(1)', name: '글자 하나 보기', description: 's[i]', example: 's[0]', growth: 1 },
        { notation: 'O(n)', name: '전체 순회', description: '글자 하나씩 확인', example: 'for ch in s:', growth: 100 },
        { notation: 'O(n)', name: '연결', description: '새 문자열 만들기', example: 's1 + s2', growth: 100 },
        { notation: 'O(n log n)', name: '정렬', description: '글자 순서 정렬', example: "sorted(s)", growth: 200 },
      ],
      codeExamples: [
        {
          title: '시저 암호 - 글자를 n칸 밀기',
          language: 'python',
          code: `# 비유: 알파벳 원판을 n칸 돌리기
# A를 3칸 밀면 → D, Z를 3칸 밀면 → C (원형으로 돌아감)
def caesar(s, n):
    result = []
    for ch in s:
        if ch.isupper():  # 대문자
            # ord('A')=65, 알파벳은 26개
            result.append(chr((ord(ch) - ord('A') + n) % 26 + ord('A')))
        elif ch.islower():  # 소문자
            result.append(chr((ord(ch) - ord('a') + n) % 26 + ord('a')))
        else:
            result.append(ch)  # 공백 등은 그대로
    return ''.join(result)

print(caesar("Hello", 3))  # "Khoor"`,
        },
        {
          title: '회문 판별 - 거꾸로 읽어도 같은가?',
          language: 'python',
          code: `# "토마토" → 뒤집어도 "토마토" → 회문!
# "사이다" → 뒤집으면 "다이사" → 회문 아님

# 방법 1: 뒤집어서 비교 (가장 쉬움)
def is_palindrome(s):
    return s == s[::-1]  # s[::-1]은 뒤집기

# 방법 2: 양쪽에서 비교 (투 포인터)
def is_palindrome_v2(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False  # 양쪽이 다르면 회문 아님
        left += 1
        right -= 1
    return True

print(is_palindrome("토마토"))   # True
print(is_palindrome("사이다"))   # False`,
        },
      ],
    },
  },
  {
    id: 'hash',
    title: '해시 (Hash)',
    category: '자료구조',
    icon: 'hash',
    color: '#10b981',
    summary: '이름표를 붙여서 바로 찾을 수 있게 하는 마법의 사물함 — 검색이 O(1)!',
    week: 3,
    content: {
      references: [
        {
          title: '해시 테이블 구조',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Hash_table',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Hash_table_3_1_1_0_1_0_0_SP.svg',
        },
      ],
      description: `해시는 **이름표가 붙은 사물함**과 같습니다. "철수"라고 말하면 바로 철수의 사물함을 열어줍니다.

## 비유: 도서관 vs 해시
- **배열(도서관 번호순)**: "7번 책 주세요" → 바로 줄 수 있음. "해리포터 주세요" → 전부 뒤져야 함
- **해시(도서관 제목순)**: "해리포터 주세요" → 바로 줄 수 있음! (마법의 인덱스가 있으니까)

## Python에서의 해시
- **딕셔너리(dict)**: \`{"이름": "값"}\` 형태
- **집합(set)**: 중복 없는 모음

## 핵심: 왜 O(1)에 찾을 수 있나?
"철수"라는 키를 → 해시 함수가 → 숫자(예: 42)로 변환 → 42번 칸에 바로 접근!
배열처럼 인덱스로 접근하니까 빠른 거예요.

## 해시 충돌
다른 이름인데 같은 번호가 나올 수 있어요 (ex: "철수"→42, "민수"→42)
→ 이럴 때는 42번 칸에 목록을 만들어서 저장합니다

## PCCP에서 해시는 이럴 때 씀
- **"몇 번 나왔어?"** → Counter로 세기
- **"중복 있어?"** → set에 넣어보기
- **"이거 아까 본 적 있어?"** → dict에 저장해두기`,
      complexities: [
        { notation: 'O(1)', name: '넣기/찾기/삭제', description: '이름표로 바로 접근', example: 'd["철수"] = 100', growth: 1 },
        { notation: 'O(1)', name: '있는지 확인', description: '키가 존재하는지', example: '"철수" in d', growth: 1 },
        { notation: 'O(n)', name: '전체 순회', description: '모든 항목 확인', example: 'for k in d:', growth: 100 },
      ],
      codeExamples: [
        {
          title: '완주하지 못한 선수 찾기',
          language: 'python',
          code: `# 마라톤 참가자 중 완주 못한 1명 찾기
# 비유: 출석체크 — 참가자 명단에서 완주자를 하나씩 지우기
from collections import Counter

def solution(participant, completion):
    # Counter = 이름별로 몇 명인지 세는 출석부
    counter = Counter(participant)  # {"leo": 1, "kiki": 1, "eden": 1}
    for name in completion:
        counter[name] -= 1          # 완주한 사람 체크
    for name, count in counter.items():
        if count > 0:               # 체크 안 된 사람 = 미완주
            return name`,
        },
        {
          title: '중복 제거 — set 활용',
          language: 'python',
          code: `# 폰켓몬: N마리 중 N/2마리를 골라서 가장 많은 종류를 가지기
# 비유: 사탕 봉지에서 최대한 다양한 맛을 고르기
def solution(nums):
    kinds = len(set(nums))      # set = 중복 제거 → 종류 수
    pick = len(nums) // 2       # 고를 수 있는 수
    return min(kinds, pick)     # 종류 vs 고를 수 있는 수 중 작은 것

# [3, 1, 2, 3] → 종류: {1,2,3} = 3종, 고를 수 있는 수: 2
# → 답: 2`,
        },
      ],
    },
  },
  {
    id: 'stack-queue',
    title: '스택 / 큐 (Stack & Queue)',
    category: '자료구조',
    icon: 'layers',
    color: '#f59e0b',
    summary: '접시 쌓기(스택)와 줄 서기(큐) — 데이터를 넣고 빼는 순서가 다릅니다',
    week: 4,
    content: {
      references: [
        {
          title: '스택 자료구조',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Stack_(abstract_data_type)',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Lifo_stack.svg',
        },
        {
          title: '큐 자료구조',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Queue_(abstract_data_type)',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Data_Queue.svg',
        },
      ],
      description: `## 스택 = 접시 쌓기
접시를 쌓으면 **마지막에 올린 접시를 먼저** 꺼내겠죠? 이게 스택입니다.
→ **LIFO** (Last In, First Out: 나중에 넣은 게 먼저 나옴)

## 큐 = 줄 서기
놀이공원 줄처럼 **먼저 선 사람이 먼저** 탑니다. 이게 큐입니다.
→ **FIFO** (First In, First Out: 먼저 넣은 게 먼저 나옴)

## Python에서 사용법

### 스택 → 그냥 리스트 사용!
| 동작 | 코드 | 비유 |
|------|------|------|
| 접시 올리기 | \`stack.append(x)\` | 맨 위에 쌓기 |
| 접시 꺼내기 | \`stack.pop()\` | 맨 위에서 꺼내기 |
| 맨 위 보기 | \`stack[-1]\` | 꺼내지 않고 확인만 |

### 큐 → deque 사용! (리스트로 하면 느림)
| 동작 | 코드 | 비유 |
|------|------|------|
| 줄 서기 | \`queue.append(x)\` | 맨 뒤에 서기 |
| 입장하기 | \`queue.popleft()\` | 맨 앞 사람 입장 |

⚠️ \`list.pop(0)\`은 O(n)으로 느립니다! 큐에는 반드시 \`deque\`를 쓰세요.

## 언제 스택? 언제 큐?
- **스택**: 되돌리기(Undo), 괄호 짝 맞추기, 뒤로 가기
- **큐**: BFS 탐색, 순서대로 처리, 프린터 대기열`,
      complexities: [
        { notation: 'O(1)', name: '넣기/꺼내기', description: '맨 위/앞에서만 동작', example: 'append/pop', growth: 1 },
        { notation: 'O(1)', name: '맨 위/앞 보기', description: '꺼내지 않고 확인', example: 'stack[-1]', growth: 1 },
        { notation: 'O(n)', name: '검색', description: '전체를 뒤져야 함', example: 'x in stack', growth: 100 },
      ],
      codeExamples: [
        {
          title: '올바른 괄호 — 스택으로 짝 맞추기',
          language: 'python',
          code: `# 비유: 여는 괄호 = 접시 올리기, 닫는 괄호 = 접시 꺼내기
# 마지막에 접시가 다 비면 성공!
def solution(s):
    stack = []
    for ch in s:
        if ch == '(':
            stack.append(ch)   # 여는 괄호 → 접시 올리기
        else:  # ')'
            if not stack:      # 꺼낼 접시가 없다 → 실패
                return False
            stack.pop()        # 짝이 맞는 괄호 제거
    return len(stack) == 0     # 접시가 다 비었으면 성공

print(solution("(())()"))   # True  → 짝이 다 맞음
print(solution(")("))       # False → 첫 글자부터 틀림
print(solution("(("))       # False → 여는 괄호가 남음`,
        },
        {
          title: '기능개발 — 큐로 배포 순서 관리',
          language: 'python',
          code: `# 비유: 맨 앞 차가 안 가면 뒷차도 못 감 (톨게이트)
from collections import deque
import math

def solution(progresses, speeds):
    # 각 기능이 며칠 걸리는지 계산
    days = deque()
    for p, s in zip(progresses, speeds):
        days.append(math.ceil((100 - p) / s))
    # [7, 3, 9] → 첫째는 7일, 둘째는 3일, 셋째는 9일

    answer = []
    while days:
        front = days.popleft()  # 맨 앞 차의 완료일
        count = 1
        # 뒤에서 먼저 끝난 애들은 같이 배포
        while days and days[0] <= front:
            days.popleft()
            count += 1
        answer.append(count)
    return answer`,
        },
      ],
    },
  },
  {
    id: 'sorting',
    title: '정렬 (Sorting)',
    category: '알고리즘',
    icon: 'arrow-up-down',
    color: '#ec4899',
    summary: '뒤죽박죽인 데이터를 크기 순서대로 정리하는 방법',
    week: 5,
    content: {
      references: [
        {
          title: '정렬 알고리즘 비교 애니메이션',
          source: 'VisuAlgo',
          url: 'https://visualgo.net/en/sorting',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Merge-sort-example-300px.gif',
        },
      ],
      description: `정렬은 **카드를 크기 순서대로 정리하는 것**과 같습니다.

## 비유: 카드 정리 방법들

### 버블 정렬 (O(n²)) — 옆에 있는 것끼리 비교
- 두 장씩 비교해서 큰 게 뒤로 가게 바꾸기
- 가장 직관적이지만 느림
- 비유: **거품이 올라가듯** 큰 수가 뒤로 이동

### 병합 정렬 (O(n log n)) — 반으로 나눠서 합치기
- 카드를 반으로 나누고, 또 반으로 나누고... 1장이 되면 합치면서 정렬
- 항상 빠름, 안정적
- 비유: **우편물 분류** — 반씩 나눠서 정리한 뒤 합치기

### Python은 팀 정렬 (O(n log n))
- \`sorted()\`나 \`.sort()\`를 쓰면 내부적으로 팀 정렬을 사용
- 실전에서는 그냥 이걸 쓰면 됩니다!

## 정렬 알고리즘 비교

| 알고리즘 | 속도 | 특징 |
|---------|------|------|
| 버블 정렬 | O(n²) | 느리지만 이해하기 쉬움 |
| 선택 정렬 | O(n²) | 가장 작은 걸 찾아서 앞에 놓기 |
| 삽입 정렬 | O(n²) | 카드 게임처럼 손에 끼워넣기 |
| **병합 정렬** | O(n log n) | 반씩 나눠서 합치기, 항상 빠름 |
| **퀵 정렬** | O(n log n) 평균 | 기준 잡고 작은것/큰것 나누기 |

## PCCP에서의 정렬
- **커스텀 정렬**: \`key=\` 로 내가 원하는 기준으로 정렬
- **정렬 + 그리디**: 정렬해놓으면 탐욕법 적용이 쉬워짐`,
      complexities: [
        { notation: 'O(n²)', name: '버블/선택/삽입', description: '느리지만 단순한 정렬', example: '이중 반복문', growth: 500 },
        { notation: 'O(n log n)', name: '병합/퀵/팀 정렬', description: '실전에서 쓰는 빠른 정렬', example: 'sorted()', growth: 200 },
      ],
      codeExamples: [
        {
          title: '가장 큰 수 — 내 맘대로 정렬하기',
          language: 'python',
          code: `# [3, 30, 34] → "34330"이 가장 큰 수
# 비유: "3"과 "30"을 이어붙여보고 더 큰 쪽을 앞에 놓기
# "330" vs "303" → "330"이 더 크니까 "3"이 "30"보다 앞!
from functools import cmp_to_key

def solution(numbers):
    def compare(a, b):
        # a+b vs b+a 비교 (문자열 연결)
        if a + b > b + a:
            return -1   # a가 앞
        elif a + b < b + a:
            return 1    # b가 앞
        return 0

    nums = [str(n) for n in numbers]
    nums.sort(key=cmp_to_key(compare))
    result = ''.join(nums)
    return '0' if result[0] == '0' else result`,
        },
        {
          title: 'Python 정렬 꿀팁 모음',
          language: 'python',
          code: `students = [("철수", 85), ("영희", 92), ("민수", 78)]

# 점수 순으로 정렬 (오름차순)
students.sort(key=lambda x: x[1])
# → [("민수", 78), ("철수", 85), ("영희", 92)]

# 점수 순으로 정렬 (내림차순)
students.sort(key=lambda x: -x[1])
# → [("영희", 92), ("철수", 85), ("민수", 78)]

# 여러 기준: 점수 내림차순 → 이름 오름차순
students.sort(key=lambda x: (-x[1], x[0]))

# 원본 안 건드리고 새 리스트 만들기
new_list = sorted(students, key=lambda x: x[1])`,
        },
      ],
    },
  },
  {
    id: 'brute-force',
    title: '완전탐색 (Brute Force)',
    category: '알고리즘',
    icon: 'scan-search',
    color: '#f97316',
    summary: '될 수 있는 모든 경우를 다 해보는 무식하지만 확실한 방법',
    week: 6,
    content: {
      references: [
        {
          title: '순열과 조합 시각화',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Permutation',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Permutations_RGB.svg',
        },
      ],
      description: `완전탐색은 **자물쇠 비밀번호를 0000부터 9999까지 다 돌려보는 것**과 같습니다.
느리지만 **반드시 답을 찾을 수 있는** 가장 확실한 방법이에요.

## 비유: 자물쇠 풀기
- 4자리 자물쇠 → 0000~9999 = 10,000가지 → 다 해보면 됨
- 하지만 10자리라면? → 10,000,000,000가지 → 불가능!
→ 이런 경우 더 똑똑한 방법(DP, 그리디)이 필요합니다

## 완전탐색의 종류

### 1. 순열 (Permutation): 순서가 중요!
- A, B, C 중 2개를 **순서대로** 뽑기
- AB, AC, BA, BC, CA, CB → 6가지

### 2. 조합 (Combination): 순서 상관없이 선택만
- A, B, C 중 2개를 **그냥** 뽑기
- {A,B}, {A,C}, {B,C} → 3가지

### 3. 부분집합: 가능한 모든 그룹
- {A,B,C}의 부분집합 → {}, {A}, {B}, {C}, {A,B}, {A,C}, {B,C}, {A,B,C} → 8가지

## 완전탐색 써도 되는 기준
- n ≤ 10 → O(n!) 순열도 OK (3,628,800)
- n ≤ 20 → O(2ⁿ) 부분집합 OK (1,048,576)
- n ≤ 10,000 → O(n²) 이중반복 OK

## PCCP 팁
**먼저 완전탐색으로 풀 수 있는지 확인**하세요. 시간초과 나면 그때 최적화!`,
      complexities: [
        { notation: 'O(n²)', name: '이중 반복', description: '모든 쌍 확인', example: '두 수의 합', growth: 500 },
        { notation: 'O(2ⁿ)', name: '부분집합', description: '넣거나 안 넣거나', example: '가능한 모든 그룹', growth: 900 },
        { notation: 'O(n!)', name: '순열', description: '모든 순서 시도', example: '줄 세우기', growth: 1000 },
      ],
      codeExamples: [
        {
          title: '모의고사 — 패턴 비교하기',
          language: 'python',
          code: `# 수포자 3명이 각자 찍는 패턴이 정해져 있음
# 비유: 수포자1은 1,2,3,4,5 반복, 수포자2는 2,1,2,3,2,4,2,5 반복
def solution(answers):
    patterns = [
        [1,2,3,4,5],              # 수포자1: 1→2→3→4→5→1→2→...
        [2,1,2,3,2,4,2,5],        # 수포자2
        [3,3,1,1,2,2,4,4,5,5]     # 수포자3
    ]
    scores = [0, 0, 0]

    for i, answer in enumerate(answers):
        for j, pattern in enumerate(patterns):
            # i % len(pattern) → 패턴이 반복됨
            if answer == pattern[i % len(pattern)]:
                scores[j] += 1

    best = max(scores)
    return [i+1 for i in range(3) if scores[i] == best]`,
        },
        {
          title: '순열/조합 — itertools로 쉽게',
          language: 'python',
          code: `from itertools import permutations, combinations

# 순열: 순서가 다르면 다른 것 취급
# 비유: 반장/부반장 뽑기 (누가 반장, 누가 부반장인지 중요)
for p in permutations([1, 2, 3], 2):
    print(p)
# (1,2) (1,3) (2,1) (2,3) (3,1) (3,2) → 6가지

# 조합: 순서 상관없이 선택만
# 비유: 간식 2개 고르기 (뭘 먼저 골랐든 상관없음)
for c in combinations([1, 2, 3], 2):
    print(c)
# (1,2) (1,3) (2,3) → 3가지`,
        },
      ],
    },
  },
  {
    id: 'greedy',
    title: '탐욕법 (Greedy)',
    category: '알고리즘',
    icon: 'zap',
    color: '#eab308',
    summary: '"지금 당장 가장 좋은 걸 고르자!" — 매 순간 최선을 선택하는 방법',
    week: 7,
    content: {
      references: [
        {
          title: '그리디 알고리즘 - 활동 선택 문제',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Greedy_algorithm',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Greedy_algorithm_36_702.svg',
        },
      ],
      description: `탐욕법은 **매 순간 가장 좋아 보이는 걸 고르는** 방법입니다.

## 비유: 거스름돈 주기
1,260원 거스름돈을 줘야 할 때:
1. 500원 → 2개 (1,000원) — 가장 큰 것부터!
2. 100원 → 2개 (200원)
3. 50원 → 1개 (50원)
4. 10원 → 1개 (10원)
→ 총 6개 동전 = **최소 동전 수!**

이렇게 **매번 가장 큰 동전을 고르는** 전략이 그리디입니다.

## 그리디가 통하는 조건
⚠️ 항상 통하는 건 아닙니다!

### 통하는 경우 (탐욕 선택이 최적인 경우)
- 거스름돈 (단, 동전이 서로 배수일 때)
- 활동 선택 문제 (일찍 끝나는 것부터)
- 체육복 빌려주기

### 안 통하는 경우
- 동전이 [1, 3, 4]이고 6원을 만들 때
  - 그리디: 4+1+1 = 3개
  - 최적: 3+3 = 2개!
  → 이런 경우는 DP를 써야 합니다

## PCCP에서의 그리디
1. **정렬 먼저**: 대부분 정렬한 후에 앞/뒤부터 고르는 패턴
2. 그리디로 풀어보고, 반례가 있으면 DP로 전환`,
      complexities: [
        { notation: 'O(n log n)', name: '정렬 + 선택', description: '정렬 후 하나씩 골라가기', example: '활동 선택 문제', growth: 200 },
        { notation: 'O(n)', name: '단순 그리디', description: '정렬 없이 바로 선택', example: '체육복 빌려주기', growth: 100 },
      ],
      codeExamples: [
        {
          title: '체육복 빌려주기',
          language: 'python',
          code: `# 비유: 양옆 친구한테만 빌려줄 수 있음 (자기 번호 ±1)
def solution(n, lost, reserve):
    # 여벌 있는데 도난당한 학생은 빌려줄 수 없음
    real_lost = set(lost) - set(reserve)
    real_reserve = set(reserve) - set(lost)

    for r in sorted(real_reserve):  # 번호 순서대로
        if r - 1 in real_lost:      # 앞번호 학생에게 먼저 (그리디!)
            real_lost.remove(r - 1)
        elif r + 1 in real_lost:    # 앞에 없으면 뒷번호에게
            real_lost.remove(r + 1)

    return n - len(real_lost)  # 체육수업 들을 수 있는 학생 수`,
        },
        {
          title: '큰 수 만들기 — 스택 + 그리디',
          language: 'python',
          code: `# "4177252841"에서 4개를 지워서 가장 큰 수 만들기
# 핵심: 앞에 작은 숫자가 있으면 지워버리기! (그리디)
def solution(number, k):
    stack = []
    for digit in number:
        # 스택 맨 위가 지금 숫자보다 작으면 → 지우기
        while stack and k > 0 and stack[-1] < digit:
            stack.pop()
            k -= 1
        stack.append(digit)

    # 아직 다 못 지웠으면 뒤에서 자르기
    if k > 0:
        stack = stack[:-k]
    return ''.join(stack)

print(solution("1924", 2))       # "94"
print(solution("1231234", 3))    # "3234"`,
        },
      ],
    },
  },
  {
    id: 'dfs-bfs',
    title: 'DFS / BFS',
    category: '알고리즘',
    icon: 'git-branch',
    color: '#8b5cf6',
    summary: '미로 탐색의 두 가지 전략 — 한 길을 끝까지(DFS) vs 가까운 곳부터(BFS)',
    week: 8,
    content: {
      references: [
        {
          title: 'DFS 탐색 순서',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Depth-first_search',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Depth-First-Search.gif',
        },
        {
          title: 'BFS 탐색 순서',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Breadth-first_search',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Breadth-First-Search-Algorithm.gif',
        },
      ],
      description: `미로를 탈출해야 한다고 상상해보세요. 두 가지 전략이 있습니다.

## DFS (깊이 우선) = "한 길을 끝까지 가보기"
- 갈림길에서 **한 쪽을 골라 끝까지** 가봄
- 막히면 **돌아와서** 다른 길로
- 비유: **미로에서 벽을 따라 가기**
- 사용 도구: **스택** 또는 **재귀**

## BFS (너비 우선) = "가까운 곳부터 차례대로"
- 시작점에서 **1걸음 거리** → **2걸음 거리** → **3걸음 거리**... 순서대로
- 비유: **연못에 돌을 던지면 파문이 퍼져나가듯**
- 사용 도구: **큐**
- **최단 거리를 보장**합니다!

## 언제 DFS? 언제 BFS?

| 이런 문제면 | 이걸 써요 | 이유 |
|------------|---------|------|
| "경로가 존재하나?" | DFS | 있는지만 확인하면 됨 |
| "모든 경우 탐색" | DFS | 끝까지 가봐야 하니까 |
| "**최단 거리**는?" | **BFS** | 가까운 데부터 보니까 |
| "최소 몇 번 만에?" | **BFS** | 레벨 단위로 탐색 |

## 그래프 표현법
\`\`\`
graph = {
    1: [2, 3],    # 1번에서 2번, 3번으로 갈 수 있음
    2: [4, 5],    # 2번에서 4번, 5번으로 갈 수 있음
    3: [6],
}
\`\`\``,
      complexities: [
        { notation: 'O(V + E)', name: 'DFS / BFS', description: '모든 노드와 간선을 한 번씩 방문', example: 'V=노드 수, E=간선 수', growth: 150 },
      ],
      codeExamples: [
        {
          title: 'DFS — 타겟 넘버 (모든 경우 탐색)',
          language: 'python',
          code: `# [1, 1, 1, 1, 1]로 +/-를 조합해서 3을 만드는 경우의 수
# 비유: 갈림길에서 +와 -로 나뉘는 트리를 끝까지 내려가기

def solution(numbers, target):
    count = 0
    def dfs(i, total):
        nonlocal count
        if i == len(numbers):      # 끝까지 갔으면
            if total == target:    # 목표값과 같으면 성공!
                count += 1
            return
        dfs(i + 1, total + numbers[i])  # 이 숫자를 더하는 길
        dfs(i + 1, total - numbers[i])  # 이 숫자를 빼는 길

    dfs(0, 0)
    return count`,
        },
        {
          title: 'BFS — 게임 맵 최단거리',
          language: 'python',
          code: `# 비유: 파문처럼 한 칸씩 퍼져나가기 → 목표에 닿는 순간이 최단!
from collections import deque

def solution(maps):
    n, m = len(maps), len(maps[0])
    visited = [[False]*m for _ in range(n)]
    queue = deque([(0, 0, 1)])   # (행, 열, 거리)
    visited[0][0] = True
    dx = [-1, 1, 0, 0]  # 상하좌우
    dy = [0, 0, -1, 1]

    while queue:
        x, y, dist = queue.popleft()  # 가장 가까운 것부터
        if x == n-1 and y == m-1:
            return dist  # 도착! 이게 최단거리

        for i in range(4):  # 상하좌우 확인
            nx, ny = x + dx[i], y + dy[i]
            if 0 <= nx < n and 0 <= ny < m:
                if maps[nx][ny] == 1 and not visited[nx][ny]:
                    visited[nx][ny] = True
                    queue.append((nx, ny, dist + 1))

    return -1  # 도착 못함`,
        },
      ],
    },
  },
  {
    id: 'dynamic-programming',
    title: '동적 프로그래밍 (DP)',
    category: '알고리즘',
    icon: 'puzzle',
    color: '#ef4444',
    summary: '"전에 계산한 거 또 하지 말자!" — 메모해두고 재활용하는 똑똑한 방법',
    week: 10,
    content: {
      references: [
        {
          title: '피보나치 재귀 트리 (중복 계산)',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Dynamic_programming',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Fibonacci_dynamic_programming.svg',
        },
      ],
      description: `DP는 **"같은 계산을 두 번 하지 말자!"**는 아이디어입니다.

## 비유: 피보나치 수열로 이해하기
피보나치: 1, 1, 2, 3, 5, 8, 13... (앞의 두 수를 더하면 다음 수)

### 멍청한 방법 (단순 재귀)
fib(5)를 구하려면:
\`\`\`
fib(5) = fib(4) + fib(3)
fib(4) = fib(3) + fib(2)  ← fib(3)을 또 계산!
fib(3) = fib(2) + fib(1)  ← fib(2)를 또 계산!
\`\`\`
→ **같은 걸 몇 번이고 다시 계산** → O(2ⁿ) 너무 느림!

### 똑똑한 방법 (DP)
**한 번 계산한 건 메모**해두고 다시 안 함!
→ fib(3) 구했으면 저장 → 다음에 필요하면 바로 꺼내기
→ O(n)으로 엄청 빨라짐!

## DP 문제 풀이 4단계
1. **dp[i]가 뭔지 정의**: "dp[i]는 i번째까지의 최대/최소/경우의 수"
2. **점화식 세우기**: dp[i] = dp[i-1] + dp[i-2] 같은 관계
3. **초기값 정하기**: dp[0] = ?, dp[1] = ?
4. **반복문으로 채우기**: 작은 것부터 큰 것까지

## 언제 DP를 떠올려야 할까?
- "최소/최대를 구하세요" + 그리디로 안 풀릴 때
- "경우의 수를 구하세요"
- "~할 수 있는 방법의 수"`,
      complexities: [
        { notation: 'O(n)', name: '1차원 DP', description: 'dp 배열 한 줄', example: '피보나치, 계단 오르기', growth: 100 },
        { notation: 'O(n²)', name: '2차원 DP', description: 'dp 표 채우기', example: '정수 삼각형', growth: 500 },
        { notation: 'O(n × W)', name: '배낭 DP', description: '물건 수 × 용량', example: '냅색 문제', growth: 300 },
      ],
      codeExamples: [
        {
          title: '피보나치 — 메모 안 하면 vs 하면',
          language: 'python',
          code: `# ❌ 메모 안 하면 → 같은 걸 수십 번 다시 계산 → 느림!
def fib_slow(n):
    if n <= 1: return n
    return fib_slow(n-1) + fib_slow(n-2)  # O(2ⁿ)

# ✅ 메모하면 (Bottom-Up) → 한 번만 계산 → 빠름!
def fib_fast(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]  # 이전 결과 재활용!
    return dp[n]  # O(n)

print(fib_fast(50))  # 12586269025 (순식간에 계산!)`,
        },
        {
          title: '정수 삼각형 — 위에서 아래로 최대 합',
          language: 'python',
          code: `#     7
#    3 8       → 꼭대기에서 바닥까지
#   8 1 0        최대 합인 경로 찾기
#  2 7 4 4
# 4 5 2 6 5

def solution(triangle):
    n = len(triangle)
    dp = [[0]*len(row) for row in triangle]
    dp[0][0] = triangle[0][0]  # 꼭대기

    for i in range(1, n):
        for j in range(len(triangle[i])):
            if j == 0:  # 맨 왼쪽: 위에서 바로 내려옴만 가능
                dp[i][j] = dp[i-1][0] + triangle[i][j]
            elif j == len(triangle[i]) - 1:  # 맨 오른쪽
                dp[i][j] = dp[i-1][j-1] + triangle[i][j]
            else:  # 가운데: 왼쪽 위 vs 오른쪽 위 중 큰 것
                dp[i][j] = max(dp[i-1][j-1], dp[i-1][j]) + triangle[i][j]

    return max(dp[n-1])  # 바닥 행의 최댓값`,
        },
      ],
    },
  },
  {
    id: 'heap',
    title: '힙 (Heap)',
    category: '자료구조',
    icon: 'triangle',
    color: '#14b8a6',
    summary: '"가장 작은 것(또는 큰 것)을 바로 꺼내주는" 마법의 주머니',
    week: 11,
    content: {
      references: [
        {
          title: '최대 힙 구조',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Heap_(data_structure)',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Max-Heap.svg',
        },
      ],
      description: `힙은 **"가장 작은 걸 바로 꺼낼 수 있는 주머니"**입니다.

## 비유: 응급실 대기 순서
일반 큐(줄 서기)는 먼저 온 사람이 먼저이지만,
**응급실**은 가장 **위급한 사람부터** 진료하죠? 이게 힙(우선순위 큐)!

## 핵심 특징
- **최솟값을 O(1)에 바로 확인** (그냥 맨 위를 보면 됨)
- 넣기/빼기는 O(log n) (자동으로 정렬해줌)
- Python의 \`heapq\`는 **최소 힙** (가장 작은 값이 맨 위)

## Python heapq 사용법

| 뭐 하고 싶어? | 코드 | 속도 |
|--------------|------|------|
| 가장 작은 거 보기 | \`heap[0]\` | O(1) |
| 새로 넣기 | \`heapq.heappush(heap, x)\` | O(log n) |
| 가장 작은 거 빼기 | \`heapq.heappop(heap)\` | O(log n) |
| 리스트→힙 변환 | \`heapq.heapify(arr)\` | O(n) |

## 최대 힙은?
Python에는 최대 힙이 없어요. **값에 마이너스(-)를 붙여서** 우회합니다!
가장 큰 값 = 마이너스 붙이면 가장 작은 값이 되니까요.`,
      complexities: [
        { notation: 'O(1)', name: '최솟값 확인', description: '맨 위를 보기만', example: 'heap[0]', growth: 1 },
        { notation: 'O(log n)', name: '넣기/빼기', description: '넣거나 빼면 자동 정렬', example: 'heappush/heappop', growth: 50 },
        { notation: 'O(n)', name: '힙 만들기', description: '리스트를 힙으로 변환', example: 'heapify(arr)', growth: 100 },
      ],
      codeExamples: [
        {
          title: '더 맵게 — 가장 안 매운 거 섞기',
          language: 'python',
          code: `# 비유: 가장 밍밍한 음식 2개를 섞어서 매워지게 만들기
# 전부 K 이상 매워질 때까지 반복
import heapq

def solution(scoville, K):
    heapq.heapify(scoville)  # 리스트 → 힙 (최소값이 맨 위)
    count = 0

    while scoville[0] < K:      # 가장 안 매운 게 K 미만이면
        if len(scoville) < 2:
            return -1            # 더 섞을 게 없으면 실패
        first = heapq.heappop(scoville)   # 가장 안 매운 것
        second = heapq.heappop(scoville)  # 두 번째로 안 매운 것
        new = first + second * 2          # 섞기!
        heapq.heappush(scoville, new)     # 다시 넣기
        count += 1

    return count`,
        },
        {
          title: '최대 힙 — 마이너스 트릭',
          language: 'python',
          code: `import heapq

# Python은 최소 힙만 있음
# 최대 힙이 필요하면? → 마이너스를 붙이자!
scores = [85, 92, 78, 95, 88]
max_heap = [-s for s in scores]  # 부호 뒤집기
heapq.heapify(max_heap)

# 가장 큰 점수 꺼내기
best = -heapq.heappop(max_heap)  # 다시 부호 뒤집기
print(best)  # 95

# 두 번째로 큰 점수
second = -heapq.heappop(max_heap)
print(second)  # 92`,
        },
      ],
    },
  },
  // ===== 추가 알고리즘 =====
  {
    id: 'binary-search',
    title: '이진 탐색 (Binary Search)',
    category: '알고리즘',
    icon: 'scan-search',
    color: '#0ea5e9',
    summary: '정렬된 데이터에서 반씩 줄여가며 찾기 — 1,000,000개도 20번이면 찾음!',
    week: null,
    content: {
      references: [
        {
          title: '이진 탐색 시각화',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Binary_search_algorithm',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Binary_Search_Depiction.svg',
        },
      ],
      description: `이진 탐색은 **"업다운 게임"**과 같습니다.

## 비유: 1~100 숫자 맞추기
친구가 57을 생각했다면:
1. "50?" → "업!" (50보다 큼)
2. "75?" → "다운!" (75보다 작음)
3. "62?" → "다운!"
4. "56?" → "업!"
5. "59?" → "다운!"
6. "57?" → "정답!"

**매번 절반을 없애니까** 100개 중에서도 최대 7번이면 찾아요!
→ **O(log n)**

## 핵심 조건
⚠️ **반드시 정렬되어 있어야** 합니다!
정렬 안 된 데이터에는 이진 탐색을 쓸 수 없어요.

## 이진 탐색이 얼마나 빠른가?

| 데이터 수 | 최대 비교 횟수 |
|----------|--------------|
| 100 | 7번 |
| 10,000 | 14번 |
| 1,000,000 | 20번 |
| 10억 | 30번 |

## PCCP에서의 활용
- **특정 값 찾기**: 정렬 후 이진 탐색
- **매개변수 탐색**: "조건을 만족하는 최솟값/최댓값"을 이진 탐색으로 찾기
- Python의 \`bisect\` 모듈을 활용하면 편리`,
      complexities: [
        { notation: 'O(log n)', name: '이진 탐색', description: '반씩 줄여가며 찾기', example: '100만 개에서 20번', growth: 10 },
        { notation: 'O(n log n)', name: '정렬 + 이진 탐색', description: '정렬 후 탐색', example: '전처리가 필요한 경우', growth: 200 },
      ],
      codeExamples: [
        {
          title: '이진 탐색 기본 구현',
          language: 'python',
          code: `# 정렬된 배열에서 target 찾기
# 비유: 사전에서 단어 찾기 — 가운데를 펴서 앞/뒤를 결정
def binary_search(arr, target):
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2  # 가운데
        if arr[mid] == target:
            return mid             # 찾았다!
        elif arr[mid] < target:
            left = mid + 1         # 오른쪽 절반만 보기
        else:
            right = mid - 1        # 왼쪽 절반만 보기

    return -1  # 못 찾음

arr = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search(arr, 7))   # 3 (인덱스)
print(binary_search(arr, 10))  # -1 (없음)`,
        },
        {
          title: 'bisect 모듈 — Python의 이진 탐색 도구',
          language: 'python',
          code: `import bisect

arr = [1, 3, 5, 7, 9, 11]

# 값이 들어갈 위치 찾기 (정렬 유지하면서)
pos = bisect.bisect_left(arr, 6)   # 3 (5와 7 사이)
print(pos)

# 정렬된 상태로 삽입
bisect.insort(arr, 6)
print(arr)  # [1, 3, 5, 6, 7, 9, 11]

# 매개변수 탐색 예: "시간 T 안에 끝낼 수 있나?"
# → T를 이진 탐색으로 찾기 (가능한 최소 T)
def parametric_search(tasks, workers):
    left, right = 1, max(tasks) * len(tasks)
    while left < right:
        mid = (left + right) // 2
        if can_finish(tasks, workers, mid):
            right = mid       # 가능하면 줄여보기
        else:
            left = mid + 1    # 불가능하면 늘리기
    return left`,
        },
      ],
    },
  },
  {
    id: 'knapsack',
    title: '냅색 (Knapsack)',
    category: '알고리즘',
    icon: 'puzzle',
    color: '#d946ef',
    summary: '가방에 물건을 담을 때, 무게 제한 안에서 가치를 최대로 하는 DP 문제',
    week: null,
    content: {
      references: [
        {
          title: '냅색 문제 시각화',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Knapsack_problem',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Knapsack.svg',
        },
      ],
      description: `냅색은 **"가방에 뭘 넣을지 고르는"** 문제입니다.

## 비유: 캠핑 가방 싸기
10kg까지 넣을 수 있는 가방이 있고, 물건들이 있어요:
- 텐트: 6kg, 가치 8
- 침낭: 4kg, 가치 6
- 코펠: 3kg, 가치 5
- 랜턴: 2kg, 가치 3

어떤 조합이 가장 좋을까?
→ 침낭(4kg) + 코펠(3kg) + 랜턴(2kg) = 9kg, 가치 14 ✅

## 냅색 문제의 종류

### 0/1 냅색 (넣거나 안 넣거나)
- 각 물건을 **넣거나 안 넣거나** 둘 중 하나
- DP로 풀어야 함 (그리디 안 됨!)

### 분할 가능 냅색 (쪼갤 수 있음)
- 물건을 **잘라서** 일부만 넣을 수 있음
- 그리디로 풀 수 있음 (kg당 가치가 높은 것부터)

## DP 풀이 핵심
\`dp[i][w]\` = 처음 i개 물건으로, 용량 w까지 담을 때의 최대 가치

점화식:
- 안 넣는 경우: dp[i-1][w]
- 넣는 경우: dp[i-1][w - 무게] + 가치
- 둘 중 큰 것!`,
      complexities: [
        { notation: 'O(n × W)', name: '0/1 냅색', description: '물건 수 × 가방 용량', example: 'DP 테이블 채우기', growth: 300 },
        { notation: 'O(n log n)', name: '분할 가능 냅색', description: '그리디 (kg당 가치순 정렬)', example: '비율로 정렬 후 선택', growth: 200 },
      ],
      codeExamples: [
        {
          title: '0/1 냅색 — DP로 풀기',
          language: 'python',
          code: `# 비유: 가방에 물건을 넣을지 말지 하나씩 결정
def knapsack(weights, values, capacity):
    n = len(weights)
    # dp[w] = 용량 w일 때 최대 가치
    dp = [0] * (capacity + 1)

    for i in range(n):  # 각 물건에 대해
        # 뒤에서부터 채워야 같은 물건을 두 번 안 넣음!
        for w in range(capacity, weights[i] - 1, -1):
            # 넣는 경우 vs 안 넣는 경우 중 큰 것
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])

    return dp[capacity]

# 캠핑 가방 예시
weights = [6, 4, 3, 2]   # 텐트, 침낭, 코펠, 랜턴
values  = [8, 6, 5, 3]
capacity = 10
print(knapsack(weights, values, capacity))  # 14`,
        },
        {
          title: '분할 가능 냅색 — 그리디로 풀기',
          language: 'python',
          code: `# 물건을 잘라서 넣을 수 있으면 → 그리디로 풀 수 있음!
# kg당 가치가 높은 것부터 최대한 넣기
def fractional_knapsack(weights, values, capacity):
    # (kg당 가치, 무게, 가치) 리스트 만들기
    items = [(v/w, w, v) for w, v in zip(weights, values)]
    items.sort(reverse=True)  # kg당 가치 높은 순

    total = 0
    for ratio, w, v in items:
        if capacity >= w:  # 통째로 넣기
            total += v
            capacity -= w
        else:              # 잘라서 넣기
            total += ratio * capacity
            break
    return total`,
        },
      ],
    },
  },
  {
    id: 'union-find',
    title: '유니온 파인드 (Union-Find)',
    category: '자료구조',
    icon: 'git-branch',
    color: '#f43f5e',
    summary: '"같은 편인지 아닌지" 빠르게 확인하고 합치는 자료구조',
    week: null,
    content: {
      references: [
        {
          title: '유니온 파인드 구조',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Disjoint-set_data_structure',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Dsu_disjoint_sets_init.svg',
        },
      ],
      description: `유니온 파인드는 **"너랑 나랑 같은 팀이야?"**를 빠르게 확인하는 자료구조입니다.

## 비유: 반 친구들 그룹 만들기
처음에는 모두 1인 그룹:
\`\`\`
{철수} {영희} {민수} {지수} {현우}
\`\`\`

"철수랑 영희 같은 팀!" → Union(철수, 영희)
\`\`\`
{철수, 영희} {민수} {지수} {현우}
\`\`\`

"민수랑 지수 같은 팀!" → Union(민수, 지수)
\`\`\`
{철수, 영희} {민수, 지수} {현우}
\`\`\`

"철수랑 민수 같은 팀이야?" → Find(철수) ≠ Find(민수) → **다른 팀!**

"영희랑 민수 같은 팀!" → Union(영희, 민수) → 두 그룹 합침
\`\`\`
{철수, 영희, 민수, 지수} {현우}
\`\`\`

## 핵심 연산
1. **Find(x)**: x가 속한 그룹의 대표(루트)를 찾기
2. **Union(x, y)**: x의 그룹과 y의 그룹을 합치기

## 최적화 기법
- **경로 압축(Path Compression)**: Find할 때 루트를 바로 가리키게 → 거의 O(1)
- **랭크 기반 합치기**: 작은 트리를 큰 트리에 붙이기

## PCCP에서의 활용
- **네트워크 연결**: "모든 컴퓨터가 연결되어 있나?"
- **사이클 검출**: 간선을 추가할 때 이미 같은 그룹이면 사이클!
- **크루스칼 알고리즘**: 최소 신장 트리에서 사용`,
      complexities: [
        { notation: 'O(α(n))', name: 'Find / Union', description: 'α는 아커만 역함수 — 사실상 O(1)', example: '그룹 찾기/합치기', growth: 1 },
        { notation: 'O(n)', name: '초기화', description: 'n개의 1인 그룹 만들기', example: '처음 세팅', growth: 100 },
      ],
      codeExamples: [
        {
          title: '유니온 파인드 기본 구현',
          language: 'python',
          code: `# 비유: 각 사람이 "우리 팀 대표는 누구?"를 기억
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))  # 처음엔 자기 자신이 대표
        self.rank = [0] * n

    def find(self, x):
        # 대표를 찾아 올라감 (경로 압축)
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        # 두 그룹을 합치기
        px, py = self.find(x), self.find(y)
        if px == py:
            return False  # 이미 같은 그룹
        # 작은 트리를 큰 트리에 붙이기
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True

    def connected(self, x, y):
        return self.find(x) == self.find(y)

# 사용 예
uf = UnionFind(5)       # 0,1,2,3,4
uf.union(0, 1)          # 0과 1 같은 팀
uf.union(2, 3)          # 2와 3 같은 팀
print(uf.connected(0, 1))  # True (같은 팀)
print(uf.connected(0, 2))  # False (다른 팀)
uf.union(1, 3)          # 두 그룹 합치기
print(uf.connected(0, 2))  # True (이제 같은 팀!)`,
        },
        {
          title: '네트워크 연결 — 그룹 수 세기',
          language: 'python',
          code: `# n개의 컴퓨터, connections로 연결 → 몇 개의 네트워크?
# 비유: 친구 그룹이 몇 개인지 세기

def solution(n, connections):
    uf = UnionFind(n)
    for a, b in connections:
        uf.union(a, b)

    # 대표(루트)가 몇 종류인지 = 그룹 수
    groups = len(set(uf.find(i) for i in range(n)))
    return groups

# 예: 3대의 컴퓨터, 1-2만 연결
# → {0}, {1, 2} → 2개의 네트워크
print(solution(3, [[1, 2]]))  # 2`,
        },
      ],
    },
  },
  // ===== 추가 알고리즘 (확장) =====
  {
    id: 'two-pointer',
    title: '투 포인터 / 슬라이딩 윈도우',
    category: '알고리즘',
    icon: 'scan-search',
    color: '#0891b2',
    summary: '두 개의 포인터를 움직여가며 조건을 만족하는 구간이나 쌍을 빠르게 찾는 기법',
    week: null,
    content: {
      references: [
        {
          title: '투 포인터 알고리즘',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Two-pointer_technique',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Array1.svg',
        },
      ],
      description: `투 포인터는 **두 개의 손가락으로 배열을 짚어가며** 답을 찾는 방법입니다.

## 비유: 책 양쪽 끝에서 좁혀가기
500페이지 책에서 특정 페이지 조합을 찾는다고 해봅시다:
- 모든 조합을 다 해보면? → O(n²) 너무 느림
- **왼쪽 끝 + 오른쪽 끝**에서 시작해서 조건에 따라 좁혀가면? → O(n) 빠름!

## 투 포인터의 두 가지 유형

### 1. 양쪽 끝에서 좁혀가기 (Opposite Direction)
- 정렬된 배열에서 두 수의 합 찾기
- 왼쪽(left)과 오른쪽(right)에서 시작
- 합이 작으면 left++, 크면 right--

### 2. 같은 방향으로 전진 (Same Direction) = 슬라이딩 윈도우
- 연속된 구간에서 조건을 만족하는 구간 찾기
- 창문(window)을 밀듯이 start와 end를 오른쪽으로 이동

## 슬라이딩 윈도우
비유: **돋보기를 오른쪽으로 한 칸씩 밀면서** 보는 것
- 고정 크기: 길이 k인 구간의 합/최대/최소
- 가변 크기: 조건을 만족하는 최소/최대 구간

## 언제 쓰나?
- "연속된 구간에서~" → 슬라이딩 윈도우
- "정렬된 배열에서 두 수의~" → 양쪽 투 포인터
- "O(n²)을 O(n)으로 줄이고 싶을 때"`,
      complexities: [
        { notation: 'O(n)', name: '투 포인터', description: '양쪽에서 좁혀가기', example: '두 수의 합', growth: 100 },
        { notation: 'O(n)', name: '슬라이딩 윈도우', description: '창문 밀기', example: '구간 합 최대', growth: 100 },
      ],
      codeExamples: [
        {
          title: '양쪽 투 포인터 — 두 수의 합',
          language: 'python',
          code: `# 정렬된 배열에서 합이 target인 두 수 찾기
# 비유: 시소 — 가벼우면 왼쪽 올리고, 무거우면 오른쪽 내리기
def two_sum(arr, target):
    left, right = 0, len(arr) - 1

    while left < right:
        total = arr[left] + arr[right]
        if total == target:
            return [left, right]    # 찾았다!
        elif total < target:
            left += 1    # 합이 작으니 더 큰 수 쪽으로
        else:
            right -= 1   # 합이 크니 더 작은 수 쪽으로
    return []

# [1, 3, 5, 7, 9], target=8
# 1+9=10(크다) → 1+7=8 찾았다!`,
        },
        {
          title: '슬라이딩 윈도우 — 최대 구간 합',
          language: 'python',
          code: `# 길이 k인 연속 구간의 최대 합
# 비유: 3칸짜리 돋보기를 한 칸씩 밀기
def max_sum(arr, k):
    # 첫 윈도우의 합
    window = sum(arr[:k])
    best = window

    for i in range(k, len(arr)):
        # 새로 들어온 거 더하고, 빠진 거 빼기
        window += arr[i] - arr[i - k]
        best = max(best, window)
    return best

# [2, 1, 5, 1, 3, 2], k=3
# [2,1,5]=8 → [1,5,1]=7 → [5,1,3]=9 → [1,3,2]=6
# 답: 9`,
        },
        {
          title: '가변 슬라이딩 윈도우 — 합이 S 이상인 최소 구간',
          language: 'python',
          code: `# 합이 S 이상인 가장 짧은 연속 구간의 길이
def min_length_subarray(arr, S):
    start = 0
    total = 0
    min_len = float('inf')

    for end in range(len(arr)):
        total += arr[end]
        # 합이 S 이상이면 → start를 줄여보기
        while total >= S:
            min_len = min(min_len, end - start + 1)
            total -= arr[start]
            start += 1

    return min_len if min_len != float('inf') else 0`,
        },
      ],
    },
  },
  {
    id: 'recursion-backtracking',
    title: '재귀 / 백트래킹',
    category: '알고리즘',
    icon: 'git-branch',
    color: '#7c3aed',
    summary: '함수가 자기 자신을 호출하는 재귀와, 안 되면 되돌아가는 백트래킹',
    week: null,
    content: {
      references: [
        {
          title: '재귀 시각화',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Recursion_(computer_science)',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Factorial_Recursion.png',
        },
      ],
      description: `## 재귀 = 자기 자신을 부르는 함수

비유: **러시아 인형(마트료시카)**
- 큰 인형을 열면 → 작은 인형이 나오고 → 또 열면 → 더 작은 인형
- 가장 작은 인형이 나오면 멈춤 (= **기저 조건**)

### 재귀의 3요소
1. **기저 조건 (Base Case)**: 멈추는 조건 — 없으면 무한 호출!
2. **재귀 호출**: 자기 자신을 더 작은 문제로 호출
3. **문제 축소**: 매 호출마다 문제가 작아져야 함

### 재귀 vs 반복문
- 재귀로 할 수 있는 건 반복문으로도 가능 (그 반대도)
- 트리/그래프 탐색, 분할 정복은 재귀가 더 자연스러움
- 재귀는 **콜 스택**을 사용 → 너무 깊으면 스택 오버플로우!

## 백트래킹 = 안 되면 되돌아가기

비유: **미로 탈출**
- 갈림길에서 한 쪽을 선택
- 막히면? → **되돌아가서** 다른 길 선택
- 이걸 반복하면 결국 출구를 찾음

### 백트래킹의 핵심
- 완전탐색 + **가지치기(pruning)**
- 조건에 안 맞으면 **더 이상 탐색하지 않고** 되돌아감
- 완전탐색보다 훨씬 빠름 (불필요한 경우를 건너뛰니까)

## 언제 쓰나?
- "모든 경우를 구하세요" → 재귀 + 백트래킹
- "조건을 만족하는 조합" → 백트래킹
- N-Queen, 순열/조합, 스도쿠 풀기`,
      complexities: [
        { notation: 'O(2ⁿ)', name: '부분집합', description: '매번 넣기/안넣기 2갈래', example: '부분집합의 합', growth: 900 },
        { notation: 'O(n!)', name: '순열', description: '모든 순서 탐색', example: 'N-Queen', growth: 1000 },
        { notation: '가변', name: '백트래킹', description: '가지치기로 시간 절약', example: '조건 만족 조합', growth: 500 },
      ],
      codeExamples: [
        {
          title: '재귀 기초 — 팩토리얼',
          language: 'python',
          code: `# 5! = 5 × 4 × 3 × 2 × 1 = 120
# 비유: "5의 팩토리얼은 5 × (4의 팩토리얼)이야"
def factorial(n):
    if n <= 1:        # 기저 조건: 1이면 멈추기
        return 1
    return n * factorial(n - 1)  # 자기 자신을 호출

# factorial(5)
# = 5 × factorial(4)
# = 5 × 4 × factorial(3)
# = 5 × 4 × 3 × factorial(2)
# = 5 × 4 × 3 × 2 × factorial(1)
# = 5 × 4 × 3 × 2 × 1 = 120`,
        },
        {
          title: '백트래킹 — 조합 구하기',
          language: 'python',
          code: `# [1,2,3,4]에서 2개를 고르는 모든 조합
# 백트래킹: 하나 고르고 → 다음 고르고 → 되돌아가서 다른 거 고르기
def combinations(arr, k):
    result = []

    def backtrack(start, current):
        if len(current) == k:    # k개 다 골랐으면
            result.append(current[:])  # 결과 저장
            return

        for i in range(start, len(arr)):
            current.append(arr[i])     # 선택!
            backtrack(i + 1, current)  # 다음 거 고르러
            current.pop()             # 되돌리기 (백트래킹!)

    backtrack(0, [])
    return result

print(combinations([1,2,3,4], 2))
# [[1,2], [1,3], [1,4], [2,3], [2,4], [3,4]]`,
        },
        {
          title: 'N-Queen — 체스판에 퀸 놓기',
          language: 'python',
          code: `# n×n 체스판에 n개의 퀸을 서로 공격 못하게 놓기
def n_queen(n):
    result = []
    board = []  # board[i] = i번째 행의 퀸 열 위치

    def is_safe(row, col):
        for r in range(row):
            c = board[r]
            # 같은 열이거나 대각선이면 안 됨
            if c == col or abs(r - row) == abs(c - col):
                return False
        return True

    def backtrack(row):
        if row == n:
            result.append(board[:])
            return
        for col in range(n):
            if is_safe(row, col):
                board.append(col)      # 퀸 놓기
                backtrack(row + 1)     # 다음 행
                board.pop()            # 되돌리기

    backtrack(0)
    return len(result)

print(n_queen(4))  # 2가지 방법`,
        },
      ],
    },
  },
  {
    id: 'graph',
    title: '그래프 기초 (Graph)',
    category: '자료구조',
    icon: 'git-branch',
    color: '#6366f1',
    summary: '점(노드)과 선(간선)으로 관계를 표현하는 자료구조 — 지도, SNS, 네트워크의 기반',
    week: null,
    content: {
      references: [
        {
          title: '그래프 자료구조',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Graph_(abstract_data_type)',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/6n-graf.svg',
        },
      ],
      description: `그래프는 **점(노드)과 선(간선)으로 관계를 표현**하는 자료구조입니다.

## 비유: 지하철 노선도
- **역** = 노드 (Node, 정점 Vertex)
- **노선** = 간선 (Edge)
- 1호선 서울역 ↔ 시청역 = 서울역과 시청역이 간선으로 연결

## 그래프의 종류

### 방향 그래프 vs 무방향 그래프
- **무방향**: 양쪽으로 갈 수 있음 (친구 관계) — A↔B
- **방향**: 한쪽으로만 (팔로우 관계) — A→B

### 가중치 그래프
- 간선에 **비용/거리**가 붙은 그래프
- 예: 서울→부산 거리 400km

## 그래프를 코드로 표현하는 2가지 방법

### 1. 인접 리스트 (Adjacency List) — 실전에서 주로 사용
- 각 노드별로 연결된 노드 목록을 저장
- 메모리 효율적, 간선이 적을 때 유리

### 2. 인접 행렬 (Adjacency Matrix)
- n×n 2차원 배열로 연결 여부 저장
- 간선 확인이 O(1)이지만 메모리를 많이 씀

## 그래프 용어 정리

| 용어 | 뜻 | 비유 |
|------|-----|------|
| 노드(정점) | 점 | 지하철 역 |
| 간선 | 선 | 노선 |
| 차수(degree) | 연결된 간선 수 | 환승 가능 노선 수 |
| 경로 | 노드를 잇는 간선 순서 | 이동 경로 |
| 사이클 | 시작=끝인 경로 | 순환선 |
| 연결 그래프 | 모든 노드가 이어짐 | 끊긴 역 없음 |`,
      complexities: [
        { notation: 'O(V + E)', name: '인접 리스트 순회', description: 'DFS/BFS', example: '그래프 탐색', growth: 150 },
        { notation: 'O(V²)', name: '인접 행렬 저장', description: 'n×n 배열', example: '밀집 그래프', growth: 500 },
        { notation: 'O(1)', name: '인접 행렬 간선 확인', description: 'matrix[i][j]', example: '연결 여부', growth: 1 },
      ],
      codeExamples: [
        {
          title: '인접 리스트 — 가장 많이 쓰는 방법',
          language: 'python',
          code: `# 비유: 각 역마다 "갈 수 있는 역 목록"을 적어놓기
# 무방향 그래프
graph = {
    1: [2, 3],     # 1번에서 2, 3으로 갈 수 있음
    2: [1, 4, 5],  # 2번에서 1, 4, 5로
    3: [1],
    4: [2],
    5: [2],
}

# defaultdict로 만들면 더 편함
from collections import defaultdict
graph = defaultdict(list)
edges = [(1,2), (1,3), (2,4), (2,5)]
for a, b in edges:
    graph[a].append(b)
    graph[b].append(a)  # 무방향이면 양쪽 추가`,
        },
        {
          title: '인접 행렬 — 연결 여부 바로 확인',
          language: 'python',
          code: `# 비유: 표로 만들기 — matrix[i][j] = 1이면 연결
n = 5  # 노드 수
matrix = [[0] * n for _ in range(n)]

edges = [(0,1), (0,2), (1,3), (1,4)]
for a, b in edges:
    matrix[a][b] = 1
    matrix[b][a] = 1  # 무방향

# 0번과 1번 연결? → matrix[0][1] = 1 (O(1)!)
# 단점: 노드가 10000개면 10000×10000 배열 필요...`,
        },
        {
          title: '가중치 그래프 — 거리/비용 포함',
          language: 'python',
          code: `# 비유: 도시 간 거리를 포함한 지도
from collections import defaultdict

graph = defaultdict(list)
# (도착지, 거리)
graph['서울'].append(('대전', 140))
graph['서울'].append(('원주', 100))
graph['대전'].append(('서울', 140))
graph['대전'].append(('부산', 260))

# 서울에서 갈 수 있는 곳:
for city, dist in graph['서울']:
    print(f"서울 → {city}: {dist}km")`,
        },
      ],
    },
  },
  {
    id: 'shortest-path',
    title: '최단 경로 (다익스트라)',
    category: '알고리즘',
    icon: 'zap',
    color: '#dc2626',
    summary: '가중치 그래프에서 출발점→도착점까지 가장 짧은 경로를 찾는 알고리즘',
    week: null,
    content: {
      references: [
        {
          title: '다익스트라 알고리즘',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Dijkstra_Animation.gif',
        },
      ],
      description: `다익스트라는 **"출발점에서 모든 노드까지의 최단 거리"**를 구하는 알고리즘입니다.

## 비유: 내비게이션
서울에서 부산까지 가는 길이 여러 개:
- 서울→대전→부산: 400km
- 서울→원주→대구→부산: 450km
- 서울→대전→대구→부산: 420km

→ **가장 짧은 경로**를 찾는 게 다익스트라!

## 핵심 아이디어
1. 출발점의 거리를 0, 나머지를 ∞(무한대)로 설정
2. **아직 방문 안 한 노드 중 거리가 가장 짧은 노드** 선택
3. 그 노드를 거쳐가는 거리가 더 짧으면 업데이트
4. 모든 노드를 방문할 때까지 반복

비유: **파문이 퍼지듯** 가까운 곳부터 확정해나감 (BFS와 비슷하지만 거리 가중치가 있음)

## BFS vs 다익스트라

| | BFS | 다익스트라 |
|---|-----|----------|
| 가중치 | 없음 (모두 1) | 있음 (양수) |
| 자료구조 | 큐 | **우선순위 큐(힙)** |
| 시간복잡도 | O(V+E) | O((V+E) log V) |

⚠️ 다익스트라는 **음수 가중치가 있으면 사용 불가**!
음수 가중치가 있으면 벨만-포드 알고리즘을 사용합니다.

## 언제 쓰나?
- "A에서 B까지 최소 비용/거리"
- "가중치가 있는 그래프에서 최단 경로"
- 네트워크 라우팅, 게임 길찾기`,
      complexities: [
        { notation: 'O((V+E) log V)', name: '다익스트라 (힙)', description: '힙으로 최소 거리 노드 선택', example: '가중치 최단 경로', growth: 200 },
        { notation: 'O(V²)', name: '다익스트라 (배열)', description: '힙 없이 배열로', example: '노드 적을 때', growth: 500 },
      ],
      codeExamples: [
        {
          title: '다익스트라 — 힙을 이용한 구현',
          language: 'python',
          code: `# 비유: 가장 가까운 역부터 확정하면서 퍼져나가기
import heapq
from collections import defaultdict

def dijkstra(graph, start):
    # 모든 노드의 거리를 무한대로 초기화
    dist = defaultdict(lambda: float('inf'))
    dist[start] = 0

    # (거리, 노드)를 힙에 넣기
    heap = [(0, start)]

    while heap:
        d, node = heapq.heappop(heap)  # 가장 가까운 노드

        if d > dist[node]:  # 이미 더 짧은 경로를 찾았으면 스킵
            continue

        # 이웃 노드 확인
        for neighbor, weight in graph[node]:
            new_dist = d + weight
            if new_dist < dist[neighbor]:  # 더 짧은 경로 발견!
                dist[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))

    return dict(dist)

# 사용 예시
graph = defaultdict(list)
edges = [('서울','대전',140), ('서울','원주',100),
         ('대전','부산',260), ('원주','대구',200),
         ('대구','부산',120)]
for a, b, w in edges:
    graph[a].append((b, w))
    graph[b].append((a, w))

result = dijkstra(graph, '서울')
print(result['부산'])  # 400 (서울→대전→부산)`,
        },
        {
          title: '경로 추적 — 어떤 길로 갔는지 기록',
          language: 'python',
          code: `# 최단 거리뿐 아니라 "어떤 경로로 갔는지"도 기록
import heapq
from collections import defaultdict

def dijkstra_with_path(graph, start, end):
    dist = defaultdict(lambda: float('inf'))
    dist[start] = 0
    prev = {}  # 이전 노드 기록
    heap = [(0, start)]

    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        if node == end:
            break
        for neighbor, weight in graph[node]:
            new_dist = d + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                prev[neighbor] = node  # 어디서 왔는지 기록
                heapq.heappush(heap, (new_dist, neighbor))

    # 경로 역추적
    path = []
    node = end
    while node in prev:
        path.append(node)
        node = prev[node]
    path.append(start)
    path.reverse()
    return dist[end], path`,
        },
      ],
    },
  },
  {
    id: 'bitmask',
    title: '비트마스킹 (Bitmask)',
    category: '알고리즘',
    icon: 'hash',
    color: '#475569',
    summary: '0과 1로 상태를 표현하여 부분집합이나 on/off 상태를 효율적으로 관리하는 기법',
    week: null,
    content: {
      references: [
        {
          title: '비트 연산',
          source: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Bit_manipulation',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Venn0001.svg',
        },
      ],
      description: `비트마스킹은 **0과 1로 켜짐/꺼짐 상태를 표현**하는 기법입니다.

## 비유: 전등 스위치
방에 전등 5개가 있다고 해봅시다:
- \`10110\` → 1번 켜짐, 2번 꺼짐, 3번 켜짐, 4번 켜짐, 5번 꺼짐
- 이걸 숫자 하나로 저장! → 10110₂ = 22

## 왜 쓰나?
- **부분집합**을 숫자 하나로 표현 가능
- 집합 연산(교집합, 합집합)이 비트 연산 한 번으로 끝남
- DP에서 상태를 압축할 때 사용

## 핵심 비트 연산

| 연산 | 기호 | 의미 | 예시 |
|------|------|------|------|
| AND | \`&\` | 둘 다 1이면 1 | 교집합 |
| OR | \`|\` | 하나라도 1이면 1 | 합집합 |
| XOR | \`^\` | 다르면 1 | 토글 |
| NOT | \`~\` | 뒤집기 | 여집합 |
| 왼쪽 시프트 | \`<<\` | 비트를 왼쪽으로 | 2배 곱하기 |
| 오른쪽 시프트 | \`>>\` | 비트를 오른쪽으로 | 2로 나누기 |

## 자주 쓰는 비트마스크 패턴

| 하고 싶은 것 | 코드 |
|-------------|------|
| i번째 비트 켜기 | \`state | (1 << i)\` |
| i번째 비트 끄기 | \`state & ~(1 << i)\` |
| i번째 비트 확인 | \`state & (1 << i)\` |
| 모든 부분집합 순회 | \`for s in range(1 << n):\` |`,
      complexities: [
        { notation: 'O(2ⁿ)', name: '모든 부분집합', description: 'n개 원소의 모든 조합', example: '비트마스크 DP', growth: 900 },
        { notation: 'O(1)', name: '비트 연산', description: '켜기/끄기/확인', example: 'state & (1<<i)', growth: 1 },
      ],
      codeExamples: [
        {
          title: '비트마스크로 부분집합 만들기',
          language: 'python',
          code: `# {A, B, C}의 모든 부분집합을 비트마스크로 표현
items = ['A', 'B', 'C']
n = len(items)

for mask in range(1 << n):  # 0~7 (000~111)
    subset = []
    for i in range(n):
        if mask & (1 << i):  # i번째 비트가 켜져있으면
            subset.append(items[i])
    print(f"{mask:03b} → {subset}")

# 000 → []
# 001 → ['A']
# 010 → ['B']
# 011 → ['A', 'B']
# 100 → ['C']
# 101 → ['A', 'C']
# 110 → ['B', 'C']
# 111 → ['A', 'B', 'C']`,
        },
        {
          title: '비트마스크 DP — 외판원 문제 (TSP)',
          language: 'python',
          code: `# n개 도시를 모두 방문하고 돌아오는 최소 비용
# dp[방문한 도시 집합][현재 도시] = 최소 비용
def tsp(dist):
    n = len(dist)
    INF = float('inf')
    # dp[mask][i] = mask에 해당하는 도시들을 방문하고 i에 있을 때 최소비용
    dp = [[INF] * n for _ in range(1 << n)]
    dp[1][0] = 0  # 0번 도시에서 출발

    for mask in range(1 << n):
        for u in range(n):
            if dp[mask][u] == INF:
                continue
            for v in range(n):
                if mask & (1 << v):  # 이미 방문했으면 스킵
                    continue
                new_mask = mask | (1 << v)  # v를 방문 표시
                new_cost = dp[mask][u] + dist[u][v]
                dp[new_mask][v] = min(dp[new_mask][v], new_cost)

    # 모든 도시 방문 후 0번으로 돌아오기
    full = (1 << n) - 1
    return min(dp[full][i] + dist[i][0] for i in range(n))`,
        },
      ],
    },
  },
];

module.exports = wikiData;
