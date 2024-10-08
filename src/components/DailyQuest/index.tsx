import style from './style.module.scss';
import {Column, Row} from "../index.ts";
import DailyIcon from '../../assets/icons/daily.png';
import 'react-circular-progressbar/dist/styles.css';
import {CircularProgressbar} from "react-circular-progressbar";
import {TierToTextColor} from "../../lib/color.ts";
import {FaCheckCircle} from "react-icons/fa";
import {TierToSummary} from "../../lib/string.ts";
import {useNavigate} from "react-router-dom";

const progressStyles = {
	root: {
		width: '18px',
	},
	path: {
		stroke: 'var(--color-primary)',
	},
	trail: {
		stroke: 'var(--color-gray-030)',
	}
}

const DailyQuest = ({ children, progress = 0, isLoggined }: { children: React.ReactNode, progress: number, isLoggined: boolean }) => {
	return (
		<Column className={style.container}>
			<Row style={{ justifyContent: 'space-between' }}>
				<Row style={{gap: '5px'}}>
					<img src={DailyIcon} alt="퀘스트 아이콘" className={style.icon}/>
					<span className={style.title}>일일 퀘스트</span>
				</Row>
				<Row style={{gap: '10px'}}>
					<Row style={{gap: '3px'}} className={style.progressData}>
						<span>{progress}</span>
						<span>/</span>
						<span>3</span>
					</Row>
					<CircularProgressbar value={progress} maxValue={3} strokeWidth={15} styles={progressStyles}/>
				</Row>
			</Row>
			<Column className={style.problemContainer} style={{ gap: '8px' }}>
				{
					!isLoggined && (
						<span className={style.empty}>로그인이 필요합니다</span>
					)
				}
				{children}
			</Column>
		</Column>
	)
}

interface QuestProblemProps {
	tier: string;
	title: string;
	ratio: number;
	solved?: boolean;
	id: number;
}

const QuestProblem = ({ tier, title, ratio, solved, id }: QuestProblemProps) => {
	const navigate = useNavigate();

	return (
		<Row style={{ opacity: solved ? 0.5: 1, justifyContent: 'space-between' }} className={style.problem} onClick={() => {
			navigate(`/problem/${id}`);
		}}>
			<Column style={{ gap: '10px' }}>
				<Row style={{ gap: '7px' }}>
					<span className={style.level} style={{ color: TierToTextColor(tier)}}>{TierToSummary(tier)}</span>
					<span>{title}</span>
				</Row>
				<Row style={{ gap: '10px' }}>
					<span className={style.ratio}>정답률 {ratio}%</span>
				</Row>
			</Column>
			{ solved && <FaCheckCircle color="var(--color-primary)" size={20} /> }
		</Row>
	)
}

DailyQuest.Problem = QuestProblem;

export default DailyQuest;
