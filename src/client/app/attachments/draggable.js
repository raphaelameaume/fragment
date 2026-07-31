/**
 *
 * @param {object} options
 * @param {Function} options.onDragStart
 * @param {Function} options.onDrag
 * @param {Function} options.onDragEnd
 * @returns {import('svelte/attachments').Attachment} */
export function draggable({ onDragStart, onDrag, onDragEnd } = {}) {
	return (node) => {
		let isDragging = false;
		/** @type {MouseEvent | undefined} */
		let eventStart;
		/** @type {DOMRect | undefined} */
		let rect;
		let classNameDragging = 'fragment-dragging';

		/**
		 *
		 * @param {MouseEvent} event
		 */
		function handleMouseDown(event) {
			isDragging = true;
			eventStart = event;

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);

			document.body.classList.add(classNameDragging);

			rect = node.getBoundingClientRect();

			const params = computeDrag(event);

			onDragStart?.(event, params);
			onDrag?.(event, params);
		}

		/**
		 *
		 * @param {MouseEvent} event
		 */
		function handleMouseMove(event) {
			onDrag?.(event, computeDrag(event));
		}

		/**
		 *
		 * @param {MouseEvent} event
		 */
		function handleMouseUp(event) {
			document.body.classList.remove(classNameDragging);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);

			isDragging = false;

			const params = computeDrag(event);
			onDrag?.(event, params);
			onDragEnd?.(event, params);
		}

		/**
		 *
		 * @param {MouseEvent} event
		 */
		function computeDrag(event) {
			let distanceX = event.clientX - eventStart.clientX;
			let distanceY = event.clientY - eventStart.clientY;

			let distance = Math.sqrt(
				distanceX * distanceX + distanceY * distanceY,
			);

			return {
				distanceX,
				distanceY,
				distance,
				isDragging,
				rect,
				node,
			};
		}

		node.addEventListener('mousedown', handleMouseDown);

		return () => {
			node.removeEventListener('mousedown', handleMouseDown);

			rect = undefined;
			eventStart = undefined;
		};
	};
}
