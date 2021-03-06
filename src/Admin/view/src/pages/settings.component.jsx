import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import DoneIcon from "@material-ui/icons/Done";
import ActionButton from "../components/action-button.component";
import FormLabel from "@material-ui/core/FormLabel";
import { styled } from "@material-ui/core/styles";
import wpRest from "../api/wp-rest";
import DurationInput from "../components/duration-input.component";
import { OutlinedInput } from "@material-ui/core";

const SettingsPage = () => {
	const [isFetching, setFetching] = useState(true);
	const [isSaving, setSaving] = useState(false);
	const [options, setOptions] = useState({});

	const handleChange = (key) => (value) => {
		return setOptions((currentValues) => ({ ...currentValues, [key]: value }));
	};
	const handleSubmit = () => {
		setSaving(true);
		wpRest.setOptions(options).finally(() => setSaving(false));
	};

	useEffect(() => {
		wpRest
			.getOptions()
			.then(setOptions)
			.finally(() => setFetching(false));
	}, []);

	if (isFetching)
		return (
			<Container>
				<CircularProgress />
				<Typography>Loading settings</Typography>
			</Container>
		);

	return (
		<>
			<Typography variant="h3" gutterBottom>
				Settings
			</Typography>
			<DurationSetting
				value={options.seconds_between_any_popup}
				handleChange={handleChange("seconds_between_any_popup")}
				label="Minimum time between any popups"
			/>
			<DurationSetting
				value={options.seconds_between_same_popup}
				handleChange={handleChange("seconds_between_same_popup")}
				label="Minimum time between popups of the same group"
			/>
			<DurationSetting
				value={options.seconds_between_any_retrieval}
				handleChange={handleChange("seconds_between_any_retrieval")}
				label="Minimum time between any coupon retrievals"
			/>
			<DurationSetting
				value={options.seconds_between_same_retrieval}
				handleChange={handleChange("seconds_between_same_retrieval")}
				label="Minimum time between retrievals of the same group"
			/>
			<DurationSetting
				value={options.seconds_valid_after_distribution}
				handleChange={handleChange("seconds_valid_after_distribution")}
				label="Minimum time of coupon validity"
			/>
			<DurationSetting
				value={options.seconds_from_page_load_to_popup}
				handleChange={handleChange("seconds_from_page_load_to_popup")}
				label="Time between page load and popup display"
			/>
			<Label>
				<LabelText>Popup z-index</LabelText>
				<NumberInput
					type="number"
					value={options.modal_z_index}
					onChange={(event) =>
						handleChange("modal_z_index")(event.target.value)
					}
				/>
			</Label>
			<ActionButton Icon={DoneIcon} isLoading={isSaving} onClick={handleSubmit}>
				Save options
			</ActionButton>
		</>
	);
};

const Container = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: theme.spacing(2),
}));

const DurationSetting = ({ label, value, handleChange }) => {
	return (
		<Label>
			<LabelText>{label}</LabelText>
			<DurationInput value={value} onChange={handleChange} />
		</Label>
	);
};

const Label = styled(FormLabel)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	gap: theme.spacing(1, 3),
	marginBottom: theme.spacing(4),
	[theme.breakpoints.up("md")]: {
		flexDirection: "row",
		alignItems: "center",
	},
}));

const LabelText = styled("span")(({ theme }) => ({
	display: "inline-block",
	lineHeight: 1.5,
	[theme.breakpoints.up("md")]: {
		width: 300,
		textAlign: "right",
	},
}));

const NumberInput = styled(OutlinedInput)(({ theme }) => ({
	width: "8rem",
	"& .MuiOutlinedInput-input": {
		padding: theme.spacing(1),
	},
}));

export default SettingsPage;
