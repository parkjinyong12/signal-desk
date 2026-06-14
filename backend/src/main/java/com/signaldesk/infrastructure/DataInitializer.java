package com.signaldesk.infrastructure;

import com.signaldesk.domain.entity.RssFeed;
import com.signaldesk.domain.entity.User;
import com.signaldesk.domain.entity.UserInterest;
import com.signaldesk.domain.repository.RssFeedRepository;
import com.signaldesk.domain.repository.UserRepository;
import com.signaldesk.domain.service.InterestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InterestService interestService;
    private final RssFeedRepository rssFeedRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User user = userRepository.save(User.builder()
                .email("user@signaldesk.io")
                .name("Signal Desk User")
                .build());
            log.info("Default user created: id={}", user.getId());

            String[][] defaultInterests = {
                {"투자", "HBM", "10"},
                {"투자", "반도체", "10"},
                {"투자", "전력인프라", "9"},
                {"투자", "변압기", "8"},
                {"투자", "조선", "8"},
                {"투자", "방산", "8"},
                {"투자", "금리", "9"},
                {"투자", "환율", "8"},
                {"부동산", "부동산 정책", "8"},
                {"부동산", "청약", "8"},
                {"개발", "Spring AI", "7"},
                {"개발", "LLM", "7"},
                {"업무", "WAF", "8"},
                {"업무", "보안", "7"},
                {"AI", "AI", "9"}
            };

            for (String[] row : defaultInterests) {
                UserInterest interest = UserInterest.builder()
                    .category(row[0])
                    .keyword(row[1])
                    .weight(Integer.parseInt(row[2]))
                    .enabled(true)
                    .build();
                interestService.createInterest(user.getId(), interest);
            }
            log.info("Default interests initialized");
        }

        if (rssFeedRepository.count() == 0) {
            Object[][] feeds = {
                // 경제 종합
                {"연합뉴스 경제", "https://www.yonhapnews.co.kr/rss/economy.xml", "경제"},
                {"한국경제", "https://www.hankyung.com/feed/economy", "경제"},
                {"매일경제", "https://www.mk.co.kr/rss/40300001/", "경제"},
                {"이데일리 경제", "https://www.edaily.co.kr/rss/economy.xml", "경제"},
                {"머니투데이", "https://news.mt.co.kr/mtview/rss.html", "경제"},
                {"서울경제", "https://www.sedaily.com/Rss/RssGet?RssTypeCode=ECONOMY", "경제"},
                {"파이낸셜뉴스", "https://www.fnnews.com/rss/fn_realnews.xml", "경제"},
                {"조선비즈", "https://biz.chosun.com/site/data/rss/rss.xml", "경제"},
                {"한겨레 경제", "https://www.hani.co.kr/rss/economy/", "경제"},
                // 투자·증권
                {"연합뉴스 주식", "https://www.yonhapnews.co.kr/rss/stock.xml", "투자"},
                {"한국경제 증권", "https://www.hankyung.com/feed/finance", "투자"},
                {"아시아경제", "https://www.asiae.co.kr/rss/stock.htm", "투자"},
                {"연합인포맥스", "https://einfomax.co.kr/rss/rss.xml", "투자"},
                {"뉴스1 경제", "https://www.news1.kr/rss/economy.xml", "경제"},
                {"이투데이", "https://www.etoday.co.kr/rss/news.xml", "경제"},
                // 부동산
                {"데일리안 부동산", "https://www.dailian.co.kr/rss/category/real.xml", "부동산"},
                // 개발·IT
                {"ZDNet Korea", "https://zdnet.co.kr/rss.asp", "개발"},
                {"전자신문", "https://www.etnews.com/rss/allArticle.xml", "개발"},
                {"디지털타임스", "https://www.dt.co.kr/rss/rss.xml", "개발"},
                {"Bloter", "https://www.bloter.net/feed", "개발"},
                // AI
                {"AI타임스", "https://www.aitimes.com/rss/allArticle.xml", "AI"},
            };

            for (Object[] row : feeds) {
                try {
                    rssFeedRepository.save(RssFeed.builder()
                        .name((String) row[0])
                        .url((String) row[1])
                        .category((String) row[2])
                        .enabled(true)
                        .build());
                } catch (Exception e) {
                    log.warn("RSS 피드 초기화 실패: {}", row[0]);
                }
            }
            log.info("Default RSS feeds initialized");
        }
    }
}
