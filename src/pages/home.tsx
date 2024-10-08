import {ChangeEvent, useCallback, useEffect, useState} from "react";
import {
	Banner,
	Column,
	DailyQuest,
	InfiniteScroll,
	ProblemTable,
	Row,
	SearchBar,
	Selector,
	Skeleton,
	Streak,
} from "../components";
import style from "../styles/pages/home.module.scss";
import {OptionsLanguage, OptionsLevel, OptionsSort} from "../constant/select";
import TemplateHeader from "../template/header";
import useDebounce from "../hooks/useDebounce";
import {request, requestNoAuth} from "../lib/axios";
import {getIsLoggedIn} from "../lib/idb.ts";

interface Problem {
    level: number;
    title: string;
    solved: number;
    ratio: number;
}

interface DailyQuestProblemAPI {
    subject: string;
    rankPoint: string;
    solved: boolean;
    problemNumber: number;
}

const PageHome = () => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [totalProblems, setTotalProblems] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [level, setLevel] = useState("");
    const [language, setLanguage] = useState("");
    const [sort, setSort] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // 일일 퀘스트
    const [dailyQuest, setDailyQuest] = useState([]);
    const [dailyQuestProgress, setDailyQuestProgress] = useState(0);

    // Track login state
    const [isLoggined, setIsLoggined] = useState<boolean>(false);

    // Track loading state to prevent duplicate requests
    const [loading, setLoading] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 1000);

    const fetchProblems = useCallback(
        async (page: number, level: string, language: string, sort: string, query: string) => {
            if (loading || !hasMore) return;  // Prevent duplicate requests or unnecessary calls

            setLoading(true);

            try {
                const response = await requestNoAuth.post("/problem/search", {
                    params: {
                        page,
                        level,
                        language,
                        sort,
                        query,
                    },
                });

                setProblems((prevProblems) => [
                    ...prevProblems,
                    ...response.data.problems,
                ]);
                setTotalProblems(response.data.total);
                setHasMore(response.data.problems.length > 0);
            } catch (error) {
                console.error("Failed to fetch problems", error);
            } finally {
                setLoading(false);
            }
        },
        [loading, hasMore]
    );

    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) {
            return;
        }
        setPage((prevPage) => prevPage + 1);
    }, [loading]);

    useEffect(() => {
        setProblems([]); // Clear problems when filters change
        setPage(1);
        fetchProblems(1, level, language, sort, debouncedSearchQuery);
    }, [level, language, sort, debouncedSearchQuery, fetchProblems]);

    useEffect(() => {
        if (page > 1) {
            fetchProblems(page, level, language, sort, debouncedSearchQuery);
        }
    }, [page, level, language, sort, debouncedSearchQuery, fetchProblems]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Fetch login status and daily quest
    useEffect(() => {
        const fetchDailyQuest = async () => {
            const loggedIn = await getIsLoggedIn();
            setIsLoggined(loggedIn);

            if (loggedIn) {
                try {
                    const response = await request("/main/authed");
                    if (response.data.dailyQuest === null) return;
                    setDailyQuest(response.data.dailyQuest);

                    response.data.dailyQuest.forEach((quest: DailyQuestProblemAPI) => {
                        if (quest.solved) setDailyQuestProgress((prev) => prev + 1);
                    });
                } catch (error) {
                    console.error("Error fetching daily quest data:", error);
                }
            }
        };

        fetchDailyQuest();
    }, []);

    return (
        <>
            <TemplateHeader />
            <Banner />
            <div className={style.problemContainer}>
                <Column className={style.problemLeft}>
                    <SearchBar
                        placeholder="문제의 제목이나 내용을 입력하세요"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    />
                    <Row style={{ gap: "10px" }}>
                        <Selector
                            options={OptionsLevel}
                            onChange={(e) => setLevel(e)}
                            styles={{ minWidth: "130px" }}
                        />
                        <Selector
                            options={OptionsLanguage}
                            onChange={(e) => setLanguage(e)}
                            styles={{ minWidth: "180px" }}
                        />
                        <Selector
                            options={OptionsSort}
                            onChange={(e) => setSort(e)}
                            styles={{ minWidth: "160px" }}
                        />
                    </Row>
                    <h3>{totalProblems} 문제</h3>
                    <InfiniteScroll
                        loadMore={() => setPage((prevPage) => prevPage + 1)}
                        hasMore={hasMore}
                    >
                        <ProblemTable data={problems} />
                        {totalProblems === 0 && (
                            <>
                                <Skeleton
                                    height={"60px"}
                                    skeletonStyle={{ marginTop: "-2px" }}
                                    borderRadius={"7px"}
                                />
                                <Skeleton
                                    height={"60px"}
                                    skeletonStyle={{ marginTop: "-7px" }}
                                    borderRadius={"7px"}
                                />
                                <Skeleton
                                    height={"60px"}
                                    skeletonStyle={{ marginTop: "-7px" }}
                                    borderRadius={"7px"}
                                />
                                <Skeleton
                                    height={"60px"}
                                    skeletonStyle={{ marginTop: "-7px" }}
                                    borderRadius={"7px"}
                                />
                            </>
                        )}
                    </InfiniteScroll>
                </Column>
                <Column style={{ gap: "15px" }} className={style.problemRight}>
                    <Streak />
                    <DailyQuest progress={dailyQuestProgress} isLoggined={isLoggined}>
                        {dailyQuest.map((quest: DailyQuestProblemAPI) => (
                            <DailyQuest.Problem
                                key={quest.problemNumber}  // Added a key for list rendering
                                tier={quest.rankPoint}
                                title={quest.subject}
                                ratio={0}
                                solved={quest.solved}
                                id={quest.problemNumber}
                            />
                        ))}
                    </DailyQuest>
                </Column>
            </div>
            Hello, World!
        </>
    );
};

export default PageHome;
