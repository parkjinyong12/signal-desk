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
            // 주요 한국 언론사 RSS 피드 기본값
            Object[][] feeds = {
                {"연합뉴스 경제", "https://www.yonhapnews.co.kr/rss/economy.xml", "경제"},
                {"연합뉴스 주식", "https://www.yonhapnews.co.kr/rss/stock.xml", "투자"},
                {"한국경제 뉴스", "https://www.hankyung.com/feed/economy", "경제"},
                {"매일경제", "https://www.mk.co.kr/rss/40300001/", "경제"},
                {"이데일리 경제", "https://www.edaily.co.kr/rss/economy.xml", "경제"},
                {"연합인포맥스", "https://einfomax.co.kr/rss/rss.xml", "투자"},
                {"ZDNet Korea", "https://zdnet.co.kr/rss.asp", "개발"},
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
