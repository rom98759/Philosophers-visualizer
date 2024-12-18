function parseLogs(logs) {
	const lines = logs.split('\n').filter(line => line.trim() !== '');
	const actions = [];
	const regex = /^(\d+)\s+(\d+)\s+.*?\b(eating|thinking|sleeping|.+)\b.*$/;

	const lastActions = {};

	let previousTimestamp = -1;
	for (const line of lines) {
		const match = line.match(regex);
		if (!match) {
			throw new Error(`Malformed log: "${line}"`);
		}

		const timestamp = parseInt(match[1]);
		const philosopher = parseInt(match[2]);
		const action = match[3];

		if (timestamp < previousTimestamp) {
			throw new Error("Timestamps are not in ascending order.");
		}
		previousTimestamp = timestamp;

		if (lastActions[philosopher]) {
			lastActions[philosopher].end = timestamp;
			actions.push(lastActions[philosopher]);
		}

		lastActions[philosopher] = {
			start: timestamp,
			end: null,
			philosopher,
			action,
		};
	}

	const durations = actions.filter(action => action.end !== null).map(action => action.end - action.start);
	const averageDuration = durations.length > 0 ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length : 0;

	for (const key in lastActions) {
		if (lastActions[key].end === null) {
			lastActions[key].end = lastActions[key].start + averageDuration;
			actions.push(lastActions[key]);
		}
	}

	return actions;
}

let zoomFactor = 1;

function updateZoomLevel() {
	const zoomLevelDisplay = document.getElementById('zoom-level');
	zoomLevelDisplay.textContent = `${zoomFactor}x`;
}

function generateGantt(actions) {
	const container = document.getElementById('gantt-container');
	container.innerHTML = '';

	const philosophers = [...new Set(actions.map(action => action.philosopher))].sort((a, b) => a - b);

	const minTimestamp = Math.min(...actions.map(action => action.start));
	const maxTimestamp = Math.max(...actions.map(action => action.end !== null ? action.end : minTimestamp + 1));
	const totalDuration = maxTimestamp - minTimestamp;

	philosophers.forEach(philosopher => {
		const row = document.createElement('div');
		row.classList.add('philosopher-row');

		const label = document.createElement('div');
		label.classList.add('philosopher-label');
		label.textContent = `Philosopher ${philosopher}`;
		row.appendChild(label);

		const actionsForPhilosopher = actions
			.filter(action => action.philosopher === philosopher)
			.sort((a, b) => a.start - b.start);

		actionsForPhilosopher.forEach(action => {
			const bar = document.createElement('div');
			bar.classList.add('bar');

			const duration = action.end !== null ? action.end - action.start : maxTimestamp - action.start;
			const offset = action.start - minTimestamp;

			bar.style.width = `${(duration / totalDuration) * 100 * zoomFactor}%`;
			bar.style.left = `${(offset / totalDuration) * 100 * zoomFactor}%`;

			bar.style.maxWidth = '100%';
			bar.style.width = Math.min(parseFloat(bar.style.width), 100) + '%';

			if (action.action.includes('eating')) {
				bar.classList.add('eating');
			} else if (action.action.includes('thinking')) {
				bar.classList.add('thinking');
			} else if (action.action.includes('sleeping')) {
				bar.classList.add('sleeping');
			} else {
				bar.classList.add('unknown');
			}

			if (parseFloat(bar.style.width) > 3) {
				const actionText = document.createElement('span');
				actionText.textContent = action.action;
				actionText.style.color = 'black';
				bar.appendChild(actionText);
			}

			bar.title = `Philosopher ${philosopher} ${action.action}\nStart: ${action.start}\nEnd: ${action.end !== null ? action.end : 'end -'}`;
			row.appendChild(bar);
		});

		container.appendChild(row);
	});
}

document.getElementById('generate-button').addEventListener('click', () => {
	const logs = document.getElementById('logs-input').value;

	try {
		const actions = parseLogs(logs);

		if (actions.length === 0) {
			alert('No valid actions found in logs.');
			return;
		}

		generateGantt(actions);
	} catch (error) {
		alert(error.message);
	}
});

document.getElementById('zoom-slider').addEventListener('input', (event) => {
	zoomFactor = parseFloat(event.target.value);
	updateZoomLevel();
	const logs = document.getElementById('logs-input').value;

	try {
		const actions = parseLogs(logs);

		if (actions.length === 0) {
			alert('No valid actions found in logs.');
			return;
		}

		generateGantt(actions);
	} catch (error) {
		alert(error.message);
	}
});
