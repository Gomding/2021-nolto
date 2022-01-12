# 놀토(Nolto) 소개
2021.07 ~ 현재   
초기 개발인원 : 6명 (프론트엔드 개발자 2명, 백엔드 개발자 4명)   
~~https://nolto.app~~  **현재는 서버가 내려간 상태**

놀토는 아마추어 개발자도 부담없이 **자신의 소중한 토이프로젝트를 공유하는 서비스**입니다.   

![image](https://user-images.githubusercontent.com/57378410/149063484-c0d9ae72-9423-4dd1-be75-c58d04746fdc.png)

---

# 목차

* [사용 기술 스택](#사용기술스택)
* [담당 역할](#담당역할)
* [팀 개발 방식](#팀개발방식)
* [엔티티 연관관계](#엔티티연관관계)
* [인프라](#인프라)
* [CI/CD 프로세스](#CI/CD프로세스)
* [구현 내용](#구현내용)
* [문제 해결 사례 / 배운 점](#문제해결사례/배운점)
* [아쉬운 점](#아쉬운점)

---


### 사용 기술 스택 <a id="사용기술스택"></a>
* Back-End
  - Java8 / Spring Boot 2.5.2 / JPA   
  - Gradle   
  - MariaDB 10.5.12 / Jacoco 0.8.5 / Redis 4.0.9   
* 테스트 환경
  - JUnit5, Mockito
  - H2
* 문서화 도구
  - Spring Restdocs

---

### 담당 역할 <a id="담당역할"></a>
* Java, Spring Boot, JPA를 사용, API 서버 설계/개발
* 댓글 CRUD API 설계/구현
* OAuth 활용 소셜로그인 기능 구현
  * Github, Google 로그인 구현
  * 다른 리소스 서버(Kakao, Naver.. 등등) 추가에 유연하게 설계
* DB서버 부하 분산을 위한 Replication 환경 구축
* 인프라 구축
  * Jenkins CI/CD 환경 구축
  * Nginx 활용 리버스 프록시 서버 구축

---

### 팀 개발 방식 <a id="팀개발방식"></a>
* 매일 아침 10시 데일리 미팅에서 자신의 상태와 어제 했던 작업을 공유합니다. 
* 작업 분배가 안된 상태면 오전시간에 작업을 분배하고 기한을 정합니다. 
* 완료한 작업은 PR을 생성하여 코드리뷰를 받습니다. 
* 작업 기간이 끝나면 함께 모여서 각자 구현에 대해 간단하게 설명하고 Develop 브랜치에 Merge합니다.

[브랜치 전략으로 git-flow 전략을 사용했습니다.](https://parkadd.tistory.com/101?category=967882)

---

### 엔티티 연관관계 <a id="엔티티연관관계"></a>
* 핵심 엔티티
  * User(놀토의 사용자)
  * Feed(토이 프로젝트 공유 글)
  * Like(글에 대한 좋아요)
  * Tech(기술 스택)
  * Comment(글에 대한 댓글)
  * Reply(댓글에 대한 대댓글)
  * CommentLike(댓글에 대한 좋아요)
  * Notification(알람, 유저의 상호작용에 의해 컨텐츠의 주인(유저)에게 가는 알람)
    - ex. xxx님의 xxx 글에 댓글이 달렸습니다.
<img src="https://user-images.githubusercontent.com/57378410/140917450-3e67a3e4-4d0a-4cfa-a281-6547144eba23.png" alt="erd" width="85%" height="85%"/>

---

### 인프라 <a id="인프라"></a>
* 프론트엔드 인프라   
서버 사이드 렌더링 서버와 클라이언트 사이드 렌더링을 사용. (첫 화면 로딩의 경우 서버사이드 렌더링을 통해 화면 로딩을 빠르게 함, 이후에는 JS파일이 로드된 상태이므로 페이지 이동은 SPA를 사용)   

* 백엔드 인프라   
Nginx를 활용 리버스 프록시 서버를 구성. 외부의 요청은 리버스 프록시 서버로 요청(SSL 요청의 암복호화도 담당 ssl termination)   
AWS EC2 인스턴스로 2대의 WAS 구성(Java, Spring 서버). Nginx에서 로드밸런싱을 담당.   
Refresh Token 저장을 담당하는 Redis 사용   
이미지 저장소로 AWS S3 버킷을 사용(CloudFront 함께 사용)   
AWS EC2 인스턴스로 DB서버 사용(MariaDB). Replication 환경 구축 (MasterDB 1대, SlaveDB 1대)   

![image](https://user-images.githubusercontent.com/57378410/140643445-d806da99-3625-42a5-b155-71f811f12c10.png)

---

### CI/CD 프로세스 <a id="CI/CD프로세스"></a>

Jenkins와 Github를 사용해서 구현   
놀토 Github 저장소의 main 브랜치 또는 develop 브랜치에 merge를 트리거로 CI/CD가 동작   
테스트, 빌드가 실패없이 완료되면 빌드된 jar 파일을 SFTP를 사용해 서버에 전송하고 서버의 배포 스크립트 실행
(백엔드 기준, 프론트엔드도 별로의 job으로 CD를 진행)

![image](https://user-images.githubusercontent.com/57378410/140643447-85f964a4-f4ff-4200-8f05-452b14ad069c.png)

---

### 구현 내용 <a id="구현내용"></a>
#### 댓글 CRUD API 설계/구현

토이프로젝트 글에 대한 댓글 CRUD API 구현 및 Restdocs 활용 API 명세 문서화.   
댓글 삭제 로직에 문제가 있어 트러블 슈팅 경험.(JPA에서 cascade와 ophanRemoval 옵션의 잘못된 사용)   


* 관련 Pull Request
  - [댓글 기능 구현](https://github.com/woowacourse-teams/2021-nolto/pull/349)
  - [댓글 삭제 리팩터링](https://github.com/woowacourse-teams/2021-nolto/pull/488)

<img src="https://user-images.githubusercontent.com/57378410/149061730-f9435caf-5965-4264-9097-e49221f5bc9a.png" width="60%" height="60%" title="댓글기능" alt="comment"></img><br/>

#### OAuth 활용 로그인 기능 구현

다른 소셜 로그인도 유연하게 추가하는 설계를 구현. 이를 위해 Layered Architecture 구조 적극 활용.   
리소스 서버에 **인증받는 과정**과 **리소스를 받는 과정**은 외부와 상호작용이므로 infrastructure layer에 구현체를 작성.
service layer는 적절한 소셜로그인 구현체를 선택. 구현체에 메세지 전달.

  - 관련 Pull Request
  - [OAuth 소셜 로그인 기능 구현](https://github.com/woowacourse-teams/2021-nolto/pull/181)
  - [OAuth 소셜 로그인 코드 리팩터링](https://github.com/woowacourse-teams/2021-nolto/pull/207)

* [gif는 30년이 넘은 기술로 이미지 파일 용량이 큽니다.](https://medium.com/vingle-tech-blog/stop-using-gif-as-animation-3c6d223fd35a) 이는 화면 응답에 있어서 큰 성능이슈로 이어질 수 있습니다. 때문에 mp4로 변환을 구현했습니다. 하지만 Java에서 바로 해결할 수 없는 부분이므로 외부로 눈길을 돌렸습니다. 외부 서비스에 RestTemplate으로 요청을 보내서 변환하는 방식과 **서버 내부에서 변경해주는 방식**중에 고민하다 후자를 선택했습니다. 외부 서비스는 대부분이 유료이고 외부요인으로 우리 서비스이용에 문제가 생기는 지점을 줄이고 싶었습니다. 사용할 수 있는 라이브러리로 **FFmpeg**를 찾았는데 설치하고 CLI 명령으로 이용할 수 있다는 장점이 있습니다. CLI 명령을 하는 부분은 자바의 코드로 이해하기 쉽게 구현된 [ffmpeg-wrapper 라이브러리](https://mvnrepository.com/artifact/net.bramp.ffmpeg/ffmpeg)를 사용했습니다. 해당 Convert 기능으로 3.6MB gif 파일을 0.07MB의 mp4 파일로 변환했습니다. 평균적으로 10배이상 용량을 줄일 수 있었습니다.

* OAuth2.0을 활용한 Google, Github 로그인 기능에서 다른 소셜 로그인도 유연하게 추가하는 설계를 원했습니다. 소셜 로그인쪽은 infrastructure 계층의 책임이라 생각해 소셜 로그인 추가는 infrastructure 계층에서만 추가,변경이 일어나면 되는 구조를 설계하기 위해 노력했습니다. 그 과정에서 계층을 나누는 것도 중요하지만 URL /login/oauth/{socialType}의 Pathvariable에 따라 적절한 구현체를 찾아주는것에 대해 고민했습니다. 해당 구현체들을 빈으로 등록하고 적절한 구현체를 반환해주는 Provider클래스를 만들어서 SocialType과 Oauth구현체를 매핑해주는 방식으로 해결했습니다. 추상화를 시키는 것으로 계층을 나눠주면 기능 추가를 유연하게 할 수 있고 변경점을 최소화할 수 있다는걸 이론이 아닌 몸으로 느낄 수 있었습니다.

---

### 문제 해결 사례 / 배운 점 <a id="문제해결사례/배운점"></a>

#### 문제상황 - 1
  - gif -> mp4 Convert 기능 구현 후 모든 local 환경에서 FFmpeg 프로그램의 설치 경로를 애플리케이션 환경설정 파일에 명시해줘야 빌드/테스트가 정상적으로 가능합니다. FFmpeg는 설치 방법, 운영체제에 따라 경로가 완전히 달라질 수 있어 개발자에게 불편함을 줍니다. 추가로 FFmpeg 설치도 local 환경에 필수로 해야 한다는 불편함도 존재했습니다.

#### 접근 방법 - 1
  - 문제를 해결하기 위해 두 가지 방법을 생각했습니다.
> FFmpeg를 애플리케이션 내부에 포함시켜서 실행시키기   
> FFmpeg은 설치 해야하지만 실행 경로를 애플리케이션 내부에서 자동으로 찾을 수 있도록 구현

전자를 우선시하여 진행했습니다. ffmpeg라는 키워드로 라이브러리를 검색해본 결과 javacpp와 javacv-platform 라이브러리를 사용해서 내부적으로 ffmpeg를 설치하고 실행하는 구현이 가능했습니다. 

#### 해결 방법 -1
javacv-platform은 운영체제에 따라 적절한 FFmpeg 프로그램의 jar를 제공합니다. javacpp는 JNI 코드를 생성하고 C++ 컴파일러에 전달하여 라이브러리를 빌드시킵니다. 해당 라이브러리를 활용하여 애플리케이션 내부의 ffmpeg를 사용하도록 구현했습니다.   
이 코드를 clone 받고 실행했을 때 추가적인 동작을 최소화 하는 것이 함께 일하는 개발자에게 좋은 경험을 제공할 수 있다는 것을 느꼈습니다.

---

#### 문제상황 - 2
특정 gif 이미지를 썸네일로 토이프로젝트 게시글 업로드를 시도하면 업로드가 실패하는 문제가 발생했습니다.

#### 접근 방법 - 2
애플리케이션 로그를 확인하니 `ArrayIndexOutOfBoundsException: 4096` 예외가 발생했습니다. 예외가 발생한 클래스는 GifImageReader 클래스 입니다. 로그의 예외 메세지를 기반으로 에러 추적결과 해당 gif파일의 압축률이 높은데 [java에서 gif 디코딩 표준을 위반](https://bugs.openjdk.java.net/browse/JDK-7132728)해서 생기는 문제라는 것을 알았습니다. gif 디코딩 명세는 4096 사이즈 이상의 문자열도 가질 수 있도록 해야하는데 java의 GifImageReader는 4096 사이즈를 초과하는 압축파일은 디코딩이 불가능 했습니다.

#### 해결 방법 - 2
해결하기 위해 직접 코드를 구현하는 것에 앞서 이미 문제가 해결된 패키지가 있는지 찾아봤고 앞서 발생하는 문제를 해결한 GifDecoder가 존재하는 `implementation 'com.madgag:animated-gif-lib:1.4'`의존성을 추가해서 해결했습니다.   
java도 불안정한 부분이 있음을 느꼈습니다. 또한 이미지, 영상 등의 미디어에는 신경 써야 하는 부분이 많다고 느껴서 관련 기능을 구현할 때는 꼼꼼하게 생각해봐야 발생하는 예외를 최소화할 수 있겠다고 생각했습니다.

---

#### 문제상황 - 3
하나의 피드(토이프로젝트 게시글)와 댓글, 대댓글, 유저 Entity는 양방향 관계를 가지고 있습니다.
하나의 게시글에는 **댓글**과 댓글에 대한 댓글인 **대댓글** Entity가 있습니다. 댓글 삭제 구현 시 ```댓글이 지워지면 대댓글도 함께 지워진다.```를 구현하기 위해 ```cascade = CascadeType.ALL과 orphanRemoval = true```을 사용했습니다. 하지만 댓글 삭제 자체가 안되는 문제가 있었습니다.

#### 접근 방법 - 3
에러 로그를 기반으로 추적결과 대댓글이 삭제되지 않아서 댓글을 삭제할 수 없다는 것을 알았습니다. 처음에는 객체간의 관계를 직접 끊어줘야 하는구나 생각했습니다. 댓글과 관련된 모든 관계들(유저, 피드, 대댓글)을 끊어줬습니다. 결과적으로 원하는 동작은 했지만 cascade과 orphanRemoval 설정을 제대로 활용하는 것인가 의문을 가졌습니다.

#### 해결 방법 - 3
cascade, orphanRemoval을 잘 이해하기위해 제일 먼저 시작한 것은 비슷한 Entity 구조를 만들어서 학습 테스트를 진행한 것입니다. cascade, orphanRemoval 설정에 대해 공부하고 학습테스트로 이를 증명하는 과정으로 학습을 진행했습니다.    
cascade는 Entity 상태 전파를 위해서 사용하고 orphanRemoval은 관계가 끊어진 객체를 함께 삭제할 때 사용하는것이라는 걸 학습했습니다.   
```댓글이 지워지면 대댓글도 함께 지워진다.```에 학습한 내용을 토대로 에러를 추적해본결과 댓글 삭제시 Feed 객체가 영속성 컨테이너에 존재하는데 Feed는 댓글과 대댓글에 cascade = CascadeType.ALL 설정이 걸려있습니다. 즉 댓글삭제 시 CascadeType.ALL에 의해 대댓글에 Removed 상태가 전파 됐지만 Feed에 존재하는 댓글 리스트가 CascadeType.ALL 설정에 의해 Persist 상태로 돌아오는 것입니다.
1. 댓글 삭제 -> 대댓글 Deleted 상태 전파
2. 유저가 가지는 대댓글이 존재 -> flush()가 일어나면 대댓글 상태가 Persist 상태로 변경
3. 대댓글이 삭제되지 않음 -> 대댓글이 댓글의 외래키를 가지므로 삭제가 되지않음

따라서 모든 엔티티에 CascadeType.ALL을 사용하는것을 지양하고 적절한 CascadeType을 사용함으로써 문제를 해결했습니다.
위에서는 Feed에 CascadeType.Remove를 걸어주었습니다.

```java
@OneToMany(mappedBy = "feed", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
```

---

### 아쉬운 점 <a id="아쉬운점"></a>
1. 현재는 댓글삭제 시 대댓글까지 모두 물리적 삭제를 진행합니다. 하지만 다른사람의 삭제에 의해서 나의 대댓글이 지워지는건 사용자에게 아쉬운 경험을 줄거라 생각합니다. 따라서 댓글 삭제기능에 논리 삭제를 구현해서 댓글이 삭제되더라도 대댓글은 계속 볼 수 있도록 구현하고 싶습니다. 토이프로젝트 피드 삭제도 마찬가지로요! 누군가에겐 피드에 달았던 피드백 댓글이 큰 뿌듯함일 수 있다고 생각합니다.

2. 토이프로젝트 게시글을 올리는 목적에는 자랑이나 공유가 있겠지만 피드백을 목적으로 올리는 사용자도 있습니다. 피드백 댓글을 활성화시키면 프로젝트 개발자의 성장에 많은 도움을 줄 수 있다고 생각합니다. 토이프로젝트 게시글에 피드백을 줄 수 있는 댓글타입으로 '도와줄게요'가 있습니다. 도와줄게요 댓글 타입을 많이 남기는 사람에게 댓글 좋아요 같은 수단으로 점수를 부여해서 **사용자에게 등급을 부여하는 기능을 만들고싶습니다.** 해당 기능을 통해 성취감을 올려서 피드백 댓글의 활성화시키고 이는 개발자의 성장에 도움이 될 수 있다고 생각합니다!!   
(네이버 지식인의 태양신 같은 등급을 떠올릴 수 있습니다)

3. 프로젝트 팀원 모집. 이 기능은 데모데이에 받은 피드백인데 토이 프로젝트를 만들고 싶은데 혼자 만들기는 시간도 부족하고 기술적 자원도 한정적일 수 있습니다. 놀토에서 토이프로젝트 드림팀을 모집할 수 있는 기능을 제공해주고 싶습니다. 이런 팀원 모집을 통해 만들어진 토이프로젝트가 완성되어 놀토에 올려지면 서비스를 사용하는 개발자분들에게 좋은 인사이트를 제공할 수 있습니다. 또한 토이프로젝트를 더 활성화해서 문제 해결을 위한 좋은 서비스가 탄생할 수 도 있다고 생각합니다 :)

---

<p align="center">  
<h1 align="middle"> 🧸 놀토: 놀러오세요 토이프로젝트 🎈 </h1>
<p align="center">
<img src="https://user-images.githubusercontent.com/44080404/139180406-eed179d2-f176-43ea-acc8-3b6165c60fc9.png" />
</p>


</p>

<p align="middle">부담없이 자랑하는 작고 소중한 내 토이프로젝트</p>
<p align="center"> 서툰 프로젝트라도 누구나 뿌듯하게 자랑하고 공유하는 공간,</p>
<h3 align="center"> 여기는 <b>놀토</b>입니다! </h3>

<h2 align="middle">🎥 놀토 소개 영상 </h2>

<p align="center">
  <a href="https://youtu.be/WsGyO4k2Kv0">
    <img src="http://img.youtube.com/vi/WsGyO4k2Kv0/0.jpg" alt="nolto video ">
  </a>
</p>


<h2 align="middle"> 🙋‍♀️ 놀토를 만든 사람들 🙋‍♂️</h2>
<p align="center">
  
| [아마찌](https://github.com/NewWisdom)   |  [조엘](https://github.com/PapimonLikelion)  |   [포모](https://github.com/bosl95)      |  [미키](https://github.com/0307kwon)  | [지그](https://github.com/zigsong)   | [찰리](https://github.com/Gomding)   |
| :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | 
| <img src="https://user-images.githubusercontent.com/43840561/129164013-2a88c2e7-1a93-4cc7-bbd8-c5818f5152c7.png"/> | <img src="https://user-images.githubusercontent.com/44080404/133540314-639cc580-1aa5-4bf4-8d54-b435bfe5e5f8.png" /> | <img src="https://user-images.githubusercontent.com/44080404/133540309-ae1e774e-4404-4801-bb5c-0037eab41818.PNG" /> | <img src="https://user-images.githubusercontent.com/44080404/133540317-20da5664-aa3d-4afb-809b-a7d4780a5a17.png" /> |  <img src="https://user-images.githubusercontent.com/44080404/133540321-7f8f4215-3e01-4f21-88e3-90d608377aab.png" /> | <img src="https://user-images.githubusercontent.com/44080404/133540503-22c158d4-1042-4e7c-9ee5-79c694bf5841.png" /> |

</p>

<br>
<br>

<h2 align="middle"> ⚙️ 기술 스택 ⚙️ </h2>

<p align="center">
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white"> <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/styled components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white"> 
</p>  
<p align="center">
<img src="https://img.shields.io/badge/JAVA-007396?style=for-the-badge&logo=java&logoColor=white"> <img src="https://img.shields.io/badge/Spring Boot-6DB33F?style=for-the-badge&logo=Spring Boot&logoColor=white"> <img src="https://img.shields.io/badge/JUnit5-25A162?style=for-the-badge&logo=JUnit5&logoColor=white">  <img src="https://img.shields.io/badge/mariaDB-003545?style=for-the-badge&logo=mariaDB&logoColor=white"> <img src="https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=Hibernate&logoColor=white"> 
  </p>
<p align="center">
<img src="https://img.shields.io/badge/Amazon AWS-232F3E?style=for-the-badge&logo=Amazon AWS&logoColor=white"> <img src="https://img.shields.io/badge/Amazon S3-569A31?style=for-the-badge&logo=Amazon S3&logoColor=white"> <img src="https://img.shields.io/badge/NGINX-009639?style=for-the-badge&logo=NGINX&logoColor=white">  <img src="https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=Jenkins&logoColor=white"> <img src="https://img.shields.io/badge/SonarQube-4E9BCD?style=for-the-badge&logo=SonarQube&logoColor=white"> <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white"> 
</p>

<p align="center">
<img src="https://img.shields.io/badge/ZOOM ZUN BANG-2D8CFF?style=for-the-badge&logo=ZOOM&logoColor=white"> 
</p>
