package com.signaldesk.infrastructure;

import com.signaldesk.domain.entity.User;
import com.signaldesk.domain.entity.UserInterest;
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
    }
}
