package com.wooteco.nolto.feed.application;

import com.wooteco.nolto.NotFoundException;
import com.wooteco.nolto.feed.domain.Feed;
import com.wooteco.nolto.feed.domain.Like;
import com.wooteco.nolto.feed.domain.LikeRepository;
import com.wooteco.nolto.user.domain.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class LikeService {
    private final LikeRepository likeRepository;
    private final FeedService feedService;

    public void addLike(User user, Long feedId) {
        Feed findFeed = feedService.findEntityById(feedId);
        if (user.isLiked(findFeed)) {
            throw new IllegalStateException("해당 유저가 이미 좋아요를 눌렀습니다");
        }

        likeRepository.save(new Like(user, findFeed));
    }

    public void deleteLike(User user, Long feedId) {
        Feed findFeed = feedService.findEntityById(feedId);
        Like findLike = likeRepository.findByUserAndFeed(user, findFeed)
                .orElseThrow(() -> new NotFoundException("해당 유저가 좋아요를 누르지 않았습니다"));
        likeRepository.delete(findLike);
    }
}